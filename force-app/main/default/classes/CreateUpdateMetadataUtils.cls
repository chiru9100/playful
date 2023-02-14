public class CreateUpdateMetadataUtils implements Metadata.DeployCallback {
    @AuraEnabled
    public  static void handleResult(Metadata.DeployResult result, Metadata.DeployCallbackContext context) {
        if (result.status == Metadata.DeployStatus.Succeeded) {
            System.debug(' success : '+ result);
        } else {
            System.debug(' fail : '+ result);
        }
    }
    @AuraEnabled
    public static String createUpdateMetadata(String fullName, List<String> label, List<Object> fieldWithValuesMap){
        System.debug('fullName--'+fullName);
        System.debug('label'+label);
        System.debug('fieldWithValuesMap--'+fieldWithValuesMap);
        if(fullName == null || label == null || (fieldWithValuesMap == null)){
            System.debug('Values are missing');
            return null;
        }else{
            //Map<String, String> mapStr = new Map<String, String>();
            List<String> newList = new List<String>();
            List<String> newList1= new List<String>();

             for(String str : label){
                newList.add(str);
             }
            //  for(String str1 : fullName){
            //     System.debug('str1'+str1);
            //     newList1.add(str1);

            
             //}
            Metadata.CustomMetadata customMetadata =  new Metadata.CustomMetadata();
                customMetadata.fullName = fullName;
                customMetadata.label =String.join(newList,','); 
            
            System.debug('customMetadata==='+customMetadata);
            Map<Object, Object> mapTest = new Map<Object, Object>();
            //Map<String, Object> mapOfData = new  Map<String, Object> (); 
            for(Object key : fieldWithValuesMap){
                Map<Object, Object>  theJsonList = (Map< Object, Object>)key;
                
            System.debug('theJsonList'+theJsonList);
            mapTest.putAll(theJsonList);
            }
            System.debug('mapTest'+mapTest);

            for(Object key : mapTest.keySet()){
                Metadata.CustomMetadataValue customField = new Metadata.CustomMetadataValue();
                customField.field = String.valueOf(key);
                customField.value =(mapTest.get(key) == true || mapTest.get(key)== false) ? mapTest.get(key) : String.valueOf(mapTest.get(key)); 
                customMetadata.values.add(customField);
            }
            System.debug('customMetadata--12--'+customMetadata);
            Metadata.DeployContainer mdContainer = new Metadata.DeployContainer();
            mdContainer.addMetadata(customMetadata);
            CreateUpdateMetadataUtils callback = new CreateUpdateMetadataUtils();
            Id jobId = Metadata.Operations.enqueueDeployment(mdContainer, callback);
            System.debug('jobId--'+jobId);
            return jobId != null ? 'success':'fail' ;
        }
        
    }
   
    @AuraEnabled
    public static wrapperList getObjFields(String objectName){
        System.debug('objectName: '+objectName);
        //List<wrapperList> listWrap = new List<wrapperList>();
        //List<wrapperList> wrapList = new List<wrapperList>();
        if(String.isNotBlank(objectName)){
             List<string> apiNames = new List<string>();
             List<string> labelNames = new List<string>();
             List<string> labelNames12 = new List<string>();
             List<string> lookupField = new List<string>();
            // Schema.DescribeFieldResult lookupField;
           // Schema.SObjectType lookupField;
            //wrapperList wrap = new wrapperList();
             String data;
            SObjectType ObjectType = Schema.getGlobalDescribe().get(objectName);
            Map<String,Schema.SObjectField> metadataFields = ObjectType.getDescribe().fields.getMap();
            System.debug('metadataFields=='+metadataFields);
            System.debug('metadataFields==....keys'+metadataFields.keySet());
            Map<String,String> mapOfData = new Map<String,String>();
          
            //apiNames.add(new list<string>(metadataFields.keySet()));

            //map<string,string> maplist = new map<string,string>();
            wrapperList wrap = new wrapperList();
            for(String strList : metadataFields.keySet()){
                
                 Schema.DescribeFieldResult a_Field_Description = metadataFields.get(strList).getDescribe();
               
                labelNames.add(a_Field_Description.getLabel());
                labelNames12.add(a_Field_Description.getLabel().toLowerCase());
                mapOfData.put(a_Field_Description.getLabel(), strList);
                mapOfData.put(a_Field_Description.getLabel().toLowerCase(), strList);
                apiNames.add(strList);
                Schema.DisplayType fielddataType = metadataFields.get(strList).getDescribe().getType();
                System.debug('fielddataType'+fielddataType);
                if(fielddataType == Schema.DisplayType.Reference) {
                    system.debug('Field Label===='+a_Field_Description.getReferenceTo());
                    data=  String.valueOf(a_Field_Description.getReferenceTo());
                    lookupField.add(data);
                }
               


                //apiNames.add(a_Field_Description.getLabel());
               //maplist.put(strList,a_Field_Description.getLabel());
               //listWrap.add(wrap);
                              // System.debug('list of new wrap'+listWrap);

           }
           System.debug('lookupField'+lookupField);
           labelNames.addAll(labelNames12);

           wrap.allFields = mapOfData;
           wrap.allLabels = labelNames;
           wrap.lookup = lookupField;

           System.debug('wrapppppp2222'+wrap);

          
            // wrap.add(new List<String>(metadataFields.keySet()), metadataFields.get(fieldName).getDescribe().getLabel());
          // wrapList.add(wrap);  
        //System.debug('maplist==='+listWrap);
            return wrap;
        }else {
           System.debug('error..........');
            return null;
        }
    }

    public class wrapperList{
        @AuraEnabled
        public  List<String> allLabels;
        @AuraEnabled
        public Map<String,String> allFields;
        @AuraEnabled
        public List<String> lookup;


    //     @AuraEnabled
    //     public List<String> fieldAPIName;

    //     public wrapperList(){

    //     }
    //     public wrapperList(List<String> fieldlabel, List<String> fieldAPIName){
    //         this.fieldlabel = fieldlabel;
    //         this.fieldAPIName = fieldAPIName;
    //     }
     }

     @AuraEnabled
    public static Map<String,list<string>> getObjFieldsMetadata(List<String> objectName){
        System.debug('objectName: '+objectName);
        Map<String,list<string>> metadataFields = new Map<String,list<string>>();
        //if(String.isNotBlank(objectName)){
            for(String str : objectName){
                SObjectType ObjectType = Schema.getGlobalDescribe().get(str);
                Map<String,Schema.SObjectField> metadataFields1 = ObjectType.getDescribe().fields.getMap();
                metadataFields.put(str,new List<string>(metadataFields1.keySet()));
            }
            System.debug('metadataFields==='+metadataFields);
            return metadataFields;
        //}
        
    }

    // @AuraEnabled
    // public static List<String> getObjFieldsMetadata(String objectName){
    //     System.debug('objectName: '+objectName);
    //     if(String.isNotBlank(objectName)){
    //         SObjectType ObjectType = Schema.getGlobalDescribe().get(objectName);
    //         Map<String,Schema.SObjectField> metadataFields = ObjectType.getDescribe().fields.getMap();
    //         return new List<String>(metadataFields.keySet());
    //     }else {
    //         return new List<String>();
    //     }
    // }

    // @AuraEnabled
    //     public static string getfieldValues(String objectField){
    //         SObjectType objToken = Schema.getGlobalDescribe().get('Contact');
    //         DescribeSObjectResult objDef = objToken.getDescribe();
    //         Map<String, SObjectField> fields = objDef.fields.getMap(); 
            
    //         string fieldSet = string.valueOf(fields.get(objectField));
    //         System.debug('fieldSet---'+fieldSet);
    //         System.debug('objectField===='+objectField);
            
    //         return  fieldSet;
    //     }
}