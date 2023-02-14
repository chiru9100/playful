public with sharing class callouts {
    @AuraEnabled
    public static void getresposnsefromCallout(String name,String phone){
        System.debug('name'+name);
        System.debug('phone'+phone);
        String Name1 = name;
        System.debug('Name1'+Name1);
        String Phone1 = phone;
        System.debug('Phone1'+Phone1);

        Http http = new Http();
      HttpRequest request = new HttpRequest();
    System.debug('request'+request);
    //   String query='select+Id,Name+from+Account+where+Name = chiru';
      HttpResponse response;
      request.setEndpoint('callout:ConnectChiru1_loneOrg/services/apexrest/LeadActivity/?Name='+Name1+'&Phone='+Phone1);
      request.setMethod('GET');
     // request.setEndpoint('callout:ConnectChiru1_loneOrg/services/apexrest/LeadActivity/?q=SELECT +Id,Name ,(Select +id,name +from+contacts)+FROM + Account + where + name=chiru');
      // system.debug('searchstring'+search);
     //String Endpoint='https://'+URL.getSalesforceBaseUrl().getHost()+'/services/data/v39.0/query/?q=SELECT +Id,Name ,(Select +id,name +from+contacts)+FROM + Account + where + name=\''+String.escapeSingleQuotes(Accountname)+'\'';
     //request.setHeader('Content-Type', 'application/json;charset=UTF-8');
    //String requestBody = '{ "Id": +'"Name"'}';
      //request.setBody(requestBody);
      System.debug('request'+request);
      response = http.send(request);
      System.debug('response'+response);
      System.debug('response111'+response.getBody());
        if(response.getStatusCode() == 200) {
          System.debug('1233');
     // Deserializes the JSON string into collections of primitive data types.
     // List<Contact> Contacts = (List<Contact>) JSON.deserialize(response.getBody(), List<Contact>.class);
     List<Object> con = (List<Object>)JSON.deserializeUntyped(response.getBody());
        System.debug('Contacts'+con);         
          List<Contact> conList = new List<Contact>();
          for(Object obj :con){
              Map<String, Object> mapObj = (Map<String, Object>)obj;
              System.debug('mapObj...'+mapObj);
               Contact con1= new Contact();
              String LastName = (String) mapObj.get('LastName');
               String FirstName = (String) mapObj.get('FirstName');
             con1.LastName = LastName;
              con1.FirstName = FirstName;
             con1.Phone =(string) mapObj.get('Phone'); 
              conList.add(con1);
          }
          insert conList;
                       
      
      }

}
}