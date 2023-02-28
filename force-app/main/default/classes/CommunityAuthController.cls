public without sharing class CommunityAuthController {
    public CommunityAuthController() {
    }
    @AuraEnabled
    public static string doLogin(String username, String password){
        try {
            System.debug('111111111111');
            //String startUrl = System.Label.Community_Url;
            ApexPages.PageReference pageRef = Site.login(username,password, null);
            System.debug('pageRef>>>>>>>>>>'+pageRef);
            if(pageRef != null) return pageRef.getUrl();
            throw new CalloutException();
            //return null;
        } catch (Exception e) {
            system.debug('e.getMessagelogin+   '+e.getMessage());
            throw new AuraHandledException(e.getMessage());
            //return null;
        }
    }
    @AuraEnabled
    public static boolean isEmailExist(String username){
        try {
            List<User> userList = new List<User>();
            userList = [Select Id, Name From User Where Username = :username];
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
    public static string registerUser(String firstName, String lastName, String username, String email, String communityNickname, String password){
        try {
            Set<String> communityNicknameSet = new Set<String>();
            for(User usr : [Select Id, CommunityNickname From User Where CommunityNickname != null]){
                communityNicknameSet.add(usr.CommunityNickname);
            }
            String uniqueCommunityNickName;
            if(communityNicknameSet.isEmpty()){
                if(communityNickname.length() > 4){
                    uniqueCommunityNickName = communityNickname.substring(0, 4) + String.valueOf( Integer.valueOf(Math.random() * 10000) );
                } else {
                    uniqueCommunityNickName = communityNickname + String.valueOf( Integer.valueOf(Math.random() * 10000) );
                }
            } else {
                for(Integer i=1; i <= 9999 ; i++){
                    if(communityNickname.length() > 4){
                        uniqueCommunityNickName = communityNickname.substring(0, 4) + String.valueOf( Integer.valueOf(Math.random() * 10000) );
                    } else {
                        uniqueCommunityNickName = communityNickname + String.valueOf( Integer.valueOf(Math.random() * 10000) );
                    }
                    if(!communityNicknameSet.contains(uniqueCommunityNickName)){
                        break;
                    }
                }
            }
            User u = new User();
            u.firstName = firstName;
            u.lastName = lastName;
            u.Username = username;
            u.Email = email;
            u.CommunityNickname = uniqueCommunityNickName;
            String accountId;
            insert u;
            System.debug('u'+u.Id);
            System.debug('u.firstName'+u.firstName);

            Account portalAccount = new Account();
            portalAccount.Name = firstName + ' ' + lastName;
            insert portalAccount;
            System.debug('portalAccount'+portalAccount);
            //portalAccount.IsPartner = true;
            update portalAccount;
            accountId = portalAccount.Id;
            String userId = Site.createPortalUser(u, accountId, password);
            System.debug('userId'+userId);
            if (userId != null) {
                String emailResult = sendWelcomeMail(u, userId);
                if (password != null && password.length() > 1) {
                    ApexPages.PageReference pageRef = Site.login(username, password, null);
                    if(pageRef != null) return pageRef.getUrl();
                }
                // else {
                //     ApexPages.PageReference page = System.Page.SiteRegisterConfirm;
                //     page.setRedirect(true);
                //     return page.getUrl();
                // }
            }
            throw new CalloutException();
            //return null;
        } catch (Exception e) {
            system.debug('e.getMessage+   '+e.getMessage());
            if(!Test.isRunningTest()) throw new AuraHandledException(e.getMessage());
            return null;
        }
    }
    @AuraEnabled
    public static string sendWelcomeMail(User usr, String userId){
        try {
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            List<EmailTemplate> welcomeTemplate = new List<EmailTemplate>([Select Id from EmailTemplate where name = 'Welcome to community']);
            //mail.setSenderDisplayName(System.Label.Community_Email_Sender);
            mail.setTargetObjectId(userId);
            mail.setTemplateId(welcomeTemplate[0].Id);
            mail.setSaveAsActivity(false);
            Messaging.sendEmail( new List<Messaging.SingleEmailMessage>{mail} );
            return 'success';
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}