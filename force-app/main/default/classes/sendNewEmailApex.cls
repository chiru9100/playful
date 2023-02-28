public with sharing class sendNewEmailApex {
    @AuraEnabled(cacheable=true)
    public static List<Folder> getFolders(){
        List<Folder> folders = [Select Id, Name From Folder Where Type = 'Email'];
         return folders;

    }
    @AuraEnabled(cacheable=true)
    public static List<EmailTemplate> getEmailTemplate(String selectedFolder){
       

         return [SELECT Id,Name  FROM EmailTemplate WHERE Folder.Id=:selectedFolder];

    }
    @AuraEnabled(cacheable=true)
    public static List<sObject> getObjectEmails(String selectedObj){
        Try{
        System.debug('selectedObj'+selectedObj);
        List<sObject> strdata = database.query('select id,Name ,Email From '+selectedObj);
        System.debug('strdata'+strdata);

     return strdata;
    }Catch(DMLException  e){
        System.debug('exception happened' + e.getmessage() );
        return null;

    }

    }
    @AuraEnabled(cacheable=true)
    public static List<EmailTemplate> getEmailTempSubject(String selectedEmailTemp){
        System.debug('selectedEmailTemp'+selectedEmailTemp);
        List<EmailTemplate> emailTempSub = [SELECT Id,Name ,subject,Body FROM EmailTemplate WHERE Id=:selectedEmailTemp];
        System.debug('emailTempSub'+emailTempSub);
        return emailTempSub;

    }

    @AuraEnabled(cacheable=true)
    public static void sendEmailToUser(String subject,String ccEmail, String body,String toAddress){
        System.debug('subject'+subject);
        System.debug('ccEmail'+ccEmail);
        System.debug('body'+body);
        System.debug('toAddress'+toAddress);

        try{
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            String[] toAddresses = new String[] {ccEmail};
            mail.setToAddresses(toAddresses);
            String[] toAddress1 = new String[] {toAddress};

            mail.setCcAddresses(toAddress1);
            mail.setSubject(subject);
            mail.setPlainTextBody( body);
            Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
        }catch(Exception ex){
            System.debug('error message'+ex.getMessage());
            throw new AuraHandledException(ex.getMessage());
           
        }
        
    }
}

   

