public with sharing class notewsAndAttachementsApex {
    @AuraEnabled(cacheable=true)
   public static List<Account> getContacts(){
    List<Account> conList = [Select id,Name,Phone From Account limit 10];
    return conList;

   }
   @AuraEnabled(cacheable=true)
   public static void getAttachements(String rowId){
    System.debug('rowId'+rowId);
    
    list<Attachment> attList = [select id, name from Attachment where id = :rowId];
    System.debug('attList'+attList);


   
}
}