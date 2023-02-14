public with sharing class BulkSearchApex {
    @AuraEnabled(cacheable = true)
    public static String getObject(String objectFileds ){
        // System.debug('objName'+objName);
        System.debug('objName'+objectFileds);

        return null;
    }
    
    @AuraEnabled(cacheable = true)
    public static List<wrapper> getFields(String objName, List<String> fields){
        System.debug('fields'+fields);
     
      
        List<wrapper> wrapList = new List<wrapper>();
        try {

            Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
            Schema.SObjectType leadSchema = schemaMap.get(objName);
            Map<String, Schema.SObjectField> fieldMap = leadSchema.getDescribe().fields.getMap();
            System.debug('fieldMap'+fieldMap);

            for(String field : fields){
                System.debug('field'+field);
                wrapper wrap = new wrapper();
                if(fieldMap.containsKey(field)){
                    System.debug('field'+field);

                    Schema.DescribeFieldResult fieldlabel = fieldMap.get(field).getDescribe();
                    wrap.label = fieldlabel.getLabel();
                    wrap.fieldName = fieldMap.get(field).getDescribe().getName();
                }
                wraplist.add(wrap);
            }
        } catch (Exception e) {
            System.debug('getFields exception '+e.getMessage());
        }
        return wrapList;
       
    }
    public class wrapper{
        @AuraEnabled
        public String label;
        @AuraEnabled
        public String fieldName;
        @AuraEnabled
        public String term;
        @AuraEnabled
        public sObject objctRecords;
       
    }


    @AuraEnabled(cacheable = true)
    public static List<wrapper> getSearchRecords(List<String> searchedValues, List<String> objFields, String objName1){
        List<wrapper> wrapList = new List<wrapper>();
        wrapper wrap = new wrapper();
       
        System.debug('searchedValues'+searchedValues);
        System.debug('objFields'+objFields);
        System.debug('objName1'+objName1);
        // sObject objlist = new sObject();
      
        for(String str :searchedValues){
            System.debug('str'+str);
            if(str != ''){
                wrap.term = str;
         String searchQuery = 'FIND \'' +str+ '\' IN ALL FIELDS RETURNING'+ ' ' +objName1+ objFields;
         System.debug('searchQuery'+searchQuery);
          List<List<sObject>> searchList = search.query(searchQuery);
          System.debug('searchList'+searchList);
          wrap.objctRecords = (sObject)searchList[0][0];
        }
        
        System.debug('wrap11111s'+wrap);

        wrapList.add(wrap);

    }

    
 return wrapList;
     }
   

}