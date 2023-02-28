public with sharing class loginRecordApex {
    @AuraEnabled

    public static boolean doLogin(String username, String password){
        try {
            List<User> userList = new List<User>();
            userList = [Select Id, Name From User Where Username = :username and Password__c =:password];
            System.debug('userList>>>>>>>>>>'+userList);
            return !userList.isEmpty();
            //throw new CalloutException();
        } catch (Exception e) {
            system.debug('e.getMessagelogin11111111111+   '+e.getMessage());
            throw new AuraHandledException(e.getMessage());
            //return null;
        }
    }
    @AuraEnabled
   public static void createUser(String firstName,String lastName,String email,String phone,String password , String companyName,String username){
     System.debug('firstName'+firstName);
     
     Profile p=[Select Id from Profile LIMIT 1];
     System.debug('p'+p);

    User u = new User();
    u.firstName = firstName;
    u.lastName = lastName;
    u.Username = username;
    u.Email = email;
    u.Password__c = password;
    u.Alias = 'test';
    u.CompanyName = companyName;
    u.Phone = phone;
     u.ProfileID = p.id;
                u.TimeZoneSidKey = 'America/New_York';
                u.LocaleSidKey = 'en_US';
                u.EmailEncodingKey = 'UTF-8';
                u.LanguageLocaleKey = 'en_US';
                 Insert u;
   // u.Password = password;
  System.debug('uuuu'+ u);

    String accountId;
    Account portalAccount = new Account();
     portalAccount.Name = firstName + ' ' + lastName;
     insert portalAccount;
     update portalAccount;

    accountId = portalAccount.Id;
    //  String userId = Site.createPortalUser(u, accountId, password);
    //  System.debug('userId'+userId);
    // System.debug('userId'+userId);
    // if (u.Id != null) {
    //     // String emailResult = sendWelcomeMail(u, userId);
    //     if (password != null && password.length() > 1) {
    //         ApexPages.PageReference pageRef = Site.login(email, password, null);
    //         System.debug('pageRef'+pageRef);
    //         if(pageRef != null) return pageRef.getUrl();
    //     }
       
    // }
    // throw new CalloutException();


   }
   @AuraEnabled
   public static boolean isEmailExist(String username){
       try {
           List<User> userList = new List<User>();
           userList = [Select Id, Name From User Where Username = :username ];
           System.debug('userList>>>>>>>>>>'+userList);
           return !userList.isEmpty();
           //throw new CalloutException();
       } catch (Exception e) {
           system.debug('e.getMessagelogin11111111111+   '+e.getMessage());
           throw new AuraHandledException(e.getMessage());
           //return null;
       }
   }
   @AuraEnabled
   public static boolean forgotPassword(String email,String newPassword){
       try {
           List<User> userList1 = new List<User>();
           List<User> userList = [Select Id, Name,Password__c,Username From User Where Username = :email ];
           System.debug('userList>>>>>>>>>>'+userList);
           for(User uc: userList){
            uc.Password__c = newPassword ;
            userList1.add(uc);
        }
          System.debug('userList1'+userList1);
           update userList1;
           System.debug('update...userList '+userList1);
           return !userList1.isEmpty();
           //throw new CalloutException();
       } catch (Exception e) {
           system.debug('e.getMessagelogin11111111111+   '+e.getMessage());
           throw new AuraHandledException(e.getMessage());
           //return null;
       }
   }
}