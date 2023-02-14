public class customMetadataUtils implements Metadata.DeployCallback {

    public void handleResult(Metadata.DeployResult result, Metadata.DeployCallbackContext context) {
        if (result.status == Metadata.DeployStatus.Succeeded) {
            System.debug('Deployment was successful');
        } else {
            System.debug('Deployment was not successful '+result.errorMessage);
        }
    }

    /* @AuraEnabled
    public static void createUpdateMetadata(String fullName, String label, String fieldWithValues){
        System.debug('in createUpdateMetadata fullName: '+fullName +' label: '+label);
        System.debug('fieldWithValues '+fieldWithValues);
        List<Object> results = (List<Object>) JSON.deserializeUntyped(fieldWithValues);
        Map<String, String> fieldWithValuesMap = new Map<String, String>();
        for (Object obj: results) {
            fieldWithValuesMap.putAll((Map<String, Object>)obj);
        }
        System.debug('fieldWithValuesMap '+ fieldWithValuesMap);
        Metadata.CustomMetadata customMetadata =  new Metadata.CustomMetadata();
        customMetadata.fullName = fullName;
        customMetadata.label = label;
        
        for(String key : fieldWithValuesMap.keySet()){
            Metadata.CustomMetadataValue customField = new Metadata.CustomMetadataValue();
            if(key != 'id' || key != 'Id'){
                customField.field = key;
                customField.value = fieldWithValuesMap.get(key); 
                customMetadata.values.add(customField);
            }
        }
        System.debug('customMetadata '+customMetadata);
        Metadata.DeployContainer mdContainer = new Metadata.DeployContainer();
        mdContainer.addMetadata(customMetadata);
        customMetadataUtils callback = new customMetadataUtils();
        Id jobId = Metadata.Operations.enqueueDeployment(mdContainer, callback);
    } */

    @AuraEnabled
    public static String createUpdateMetadata(String fullName, String mdtDevName, String label, string fieldWithValues){
        //Deserialize all fields information and create JSON object
        List<Object> results = (List<Object>) JSON.deserializeUntyped(fieldWithValues);
        Map<String, Object> fieldWithValuesMap = new Map<String, Object>();
        for (Object obj: results) {
            fieldWithValuesMap.putAll((Map<String, Object>)obj);
        }
        System.debug('fieldWithValuesMap '+fieldWithValuesMap);
        Metadata.CustomMetadata customMetadata = new Metadata.CustomMetadata();        
        customMetadata.fullName = fullName+'.'+mdtDevName;        
        customMetadata.label = label;        
        for (String key: fieldWithValuesMap.keySet()) {            
            Metadata.CustomMetadataValue customField = new Metadata.CustomMetadataValue();       
            if(key != 'id' || key != 'Id'){
                customField.field = key;            
                customField.value = fieldWithValuesMap.get(key);            
                customMetadata.values.add(customField);         
            }     
        }
        System.debug('customMetadata '+customMetadata);
       	Metadata.DeployContainer mdContainer = new Metadata.DeployContainer();        
        mdContainer.addMetadata(customMetadata);        
        customMetadataUtils callback = new customMetadataUtils();
        Id jobId = Test.isRunningTest() ? 'a0cM00000043ST4' : Metadata.Operations.enqueueDeployment(mdContainer, callback);
        System.debug('jobId '+jobId);
        return String.valueOf(jobId);
        // checkDeploymentStatus(jobId);
    }

    @AuraEnabled
    public static Boolean checkMdtRecord(String label){
        System.debug('label '+label);
        try {
            return String.isNotBlank(label) ? [SELECT Id FROM Application__mdt WHERE label =: label].isEmpty() : false;
        } catch (Exception e) {
            System.debug('exception '+e.getMessage());
        }
        return false;
    }
    
    @AuraEnabled
    public static String checkDeploymentStatus(String deployRequestId) {
        String result;
        HttpRequest req = new HttpRequest();
        req.setMethod('GET');     
        req.setEndpoint('callout:ApexMDAPI/services/data/v49.0/metadata/deployRequest/' + deployRequestId + '?includeDetails=true');
        
        Http http = new Http();
        try {
            HTTPResponse res = http.send(req);                 
            System.debug('STATUS:' + res.getStatus());
            System.debug('STATUS_CODE:' + res.getStatusCode());
            String responseBody = res.getBody(); 
            DeployResultJson jsonResult = (DeployResultJson)JSON.deserialize(responseBody, DeployResultJson.class);
            System.debug('jsonResult: '+ jsonResult);
            if(res.getStatusCode() == 200) {
                if(jsonResult.deployResult != null) {
                    System.debug('jsonResult deployResult status '+jsonResult.deployResult.status);
                    result = String.valueOf(jsonResult.deployResult.status);
                }
            }
        } catch(System.CalloutException e) {
            System.debug('calloutException '+e);
        }
        return result;
    }
    
    // Support unpacking via JSON.deserialize from deployRequest metadata api call
    public class DeployResultJson {       
        public String id;
        public Object validatedDeployRequestId;
        public Object deployOptions;
        public Metadata.DeployResult deployResult;
    }
}