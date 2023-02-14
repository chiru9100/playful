public with sharing class linkedIn_oAuth_Auth {
    String CLIENT_ID = '86wmn1xuzvwlgc';
    String CLIENT_SECRET = 'iRK4PngmZ1GLMvYh';
    
    public linkedIn_oAuth_Auth(){
      String  CallBack ='https://raagvitechcom-dev-ed.develop.my.salesforce.com/services/authcallback/LINKEDiN';
    }
    
    
   
        public static PageReference getCode(){
           
            String url = 'https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=86wmn1xuzvwlgc&redirect_uri=https://raagvitechcom-dev-ed.develop.my.salesforce.com/services/authcallback/LINKEDiN&state=chiru';

             PageReference p = new PageReference(url);
             System.debug('p'+p);
             return p;
        }
                public static void get(){
                   System.debug('dddddddddd');

                        String code =ApexPages.currentPage().getParameters().get('code');
                    System.debug('code'+code);
                    }
        
    
}