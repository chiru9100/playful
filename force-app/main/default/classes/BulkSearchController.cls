public class BulkSearchController {

    @AuraEnabled
    public static List<Account> accountSearch(List<String> searchTerm) {
        System.debug('search--'+searchTerm.size());
        List<Account> accList = new List<Account>();
        List<Account> accObj = new List<Account>();
        try {
            if(!searchTerm.isEmpty() && searchTerm.size() > 0){
                System.debug('in les 20--'+searchTerm.size());
                for(String s: searchTerm){
                    String query = 'FIND {'+ s +'} IN ALL FIELDS RETURNING Account(Name,Phone,Description,Industry, Website )';
                    List<List<sObject>> searchList = search.query(query);
                    if(!searchList.isEmpty()){
                        accList.add((Account)searchList[0][0]);
                    }
                    if(searchTerm.size() > 20){
                        for(String s1: searchTerm){
                            String query1 = 'FIND {'+ s1 +'} IN ALL FIELDS RETURNING Account(Name,Phone,Description,Industry, Website )';
                            List<List<sObject>> searchList1 = search.query(query1);
                            accObj.add((Account)searchList1[0][0]);
                        }
                        return accObj;
                    }
                }
            }
            
        } catch (Exception ex) {
            System.debug(ex.getMessage());
        }
        return accList;   
    }

}