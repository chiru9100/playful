public with sharing class insertTwoRecordsInCallouts {
    @AuraEnabled
    public static void getRecords(String firstName,String lastName ,String phone,String email){
    System.debug('firstName'+firstName);
   
    Http http = new Http();
    HttpRequest request = new HttpRequest();
    System.debug('request'+request);
    request.setEndpoint('callout:ConnectChiru1_loneOrg/services/apexrest/insertRecords/');
    request.setMethod('POST');
    request.setHeader('Content-Type', 'application/json;charset=UTF-8');
    String requestBody = '{ "firstName": "'+firstName+'" ,"lastName":"'+lastName+'","phone":"'+phone+'","email":"'+email+'"}';
    System.debug('request1111'+request);
    request.setBody(requestBody); 
    //   String query='select+Id,Name+from+Account+where+Name = chiru';
    HttpResponse response = http.send(request);
    System.debug('response'+response);
        if(response.getStatusCode() == 200) {
            Object results = (Object) JSON.deserializeUntyped(response.getBody());
            Map<String, Object> mapObj = (Map<String, Object>)results;
                  System.debug('mapObj...'+mapObj);
                   Contact con1= new Contact();
                  String LastName1 = (String) mapObj.get('LastName');
                   String FirstName1 = (String) mapObj.get('FirstName');
                 con1.LastName = LastName1;
                  con1.FirstName = FirstName1;
                 con1.Phone =(string) mapObj.get('Phone');
                 con1.Email = (String) mapObj.get('Email');
                 System.debug('con1'+con1);
                 insert con1;
           
        } else {
            System.debug('The status code returned was not expected: ' +
            response.getStatusCode() + ' ' + response.getStatus());
            
       
        }
           
    }
}