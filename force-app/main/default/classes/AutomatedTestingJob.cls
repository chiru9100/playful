global with sharing class AutomatedTestingJob implements Schedulable {
    
    global void execute(SchedulableContext SC) {
        doExecute();
    }

    // Have to use a future method so the email will be sent out.
    @future (callout=true)
    public static void doExecute(){
        processAsyncResults();
    }
    
    /*
        Schedule String Format: Seconds Minutes Hours Day_of_month Month Day_of_week optional_year
    */
    
    /*public static void createEvery15MinuteScheduledJobs(){
        AutomatedTestingJob atj = new AutomatedTestingJob();  
        string sch = '0 0 * * * ?';  
        system.schedule('Process Queued Unit Tests Every Top Of The Hour',sch,atj);
        
        sch = '0 15 * * * ?';  
        system.schedule('Process Queued Unit Tests At Each Quarter After',sch,atj);
        
        sch = '0 30 * * * ?';  
        system.schedule('Process Queued Unit Tests At Each Bottom Of The Hour',sch,atj);
        
        sch = '0 45 * * * ?';  
        system.schedule('Process Queued Unit Tests At Each Quarter To The Hour',sch,atj);
    }*/
    public static void processAsyncResults(){
        List<AutomatedTestingQueue__c> queuedTests = [SELECT id,name,AsyncId__c FROM AutomatedTestingQueue__c LIMIT 5];
        if (queuedTests != null && queuedTests.size() > 0){
            Set<Id> AsyncIds = new Set<Id>();

            for (AutomatedTestingQueue__c queuedJob : queuedTests){
                 AsyncIds.add(queuedJob.AsyncId__c);
                 System.debug('queuedJob'+queuedTests);
            }
            List<ApexTestQueueItem> queuedItems = checkClassStatus(AsyncIds);
            Map<Id, List<ApexTestQueueItem>> groupedTestsByJob = new Map<Id, List<ApexTestQueueItem>>();
            for (ApexTestQueueItem atqi : queuedItems){
                 if (groupedTestsByJob.containsKey(atqi.ParentJobId) == true){
                     List<ApexTestQueueItem> groupedTests = groupedTestsByJob.get(atqi.ParentJobId);
                     groupedTests.add(atqi);
                 }
                 else{
                     List<ApexTestQueueItem> groupedTests = new List<ApexTestQueueItem>();
                     groupedTests.add(atqi);
                     groupedTestsByJob.put(atqi.ParentJobId, groupedTests);
                 }
            }
            Set<Id> completedAsyncIds = getCompletedAsyncJobsIds(groupedTestsByJob);
            if (completedAsyncIds != null && completedAsyncIds.size() > 0){
                List<ApexTestResult> testResults = checkMethodStatus(completedAsyncIds);
                Map<Id, List<ApexTestResult>> groupedTestResultsByJob = new Map<Id, List<ApexTestResult>>();
                for (ApexTestResult testResult : testResults){
                    if (groupedTestResultsByJob.containsKey(testResult.AsyncApexJobId)){
                        List<ApexTestResult> groupedTestsResults = groupedTestResultsByJob.get(testResult.AsyncApexJobId);
                        groupedTestsResults.add(testResult);
                    }
                    else{
                        List<ApexTestResult> groupedTestsResults = new List<ApexTestResult>();
                        groupedTestsResults.add(testResult);
                        
                        groupedTestResultsByJob.put(testResult.AsyncApexJobId, groupedTestsResults );
                    }
                }
                List<AutomatedTestingQueue__c> queuedTestsToDelete = new List<AutomatedTestingQueue__c>(); 
                
                for (List<ApexTestResult> jobTestResults : groupedTestResultsByJob.values()){
                    sendTestResultEmail(jobTestResults);
                }
                for (AutomatedTestingQueue__c queuedTest : queuedTests){
                    for (Id completedAsyncId : completedAsyncIds){
                        if (queuedTest.AsyncId__c == completedAsyncId){
                            queuedTestsToDelete.add(queuedTest);
                            break;
                        }
                    }
                    if (groupedTestsByJob.containsKey(queuedTest.asyncId__c) == false){
                        queuedTestsToDelete.add(queuedTest);
                    }
                }
                
                if (queuedTestsToDelete.size() > 0){
                    delete queuedTestsToDelete;
                }
            }
        }
    }
    public static Set<Id> getCompletedAsyncJobsIds(Map<Id, List<ApexTestQueueItem>> groupedTestsByJob){
        Set<Id> completedAsyncJobIds = new Set<Id>();
        
        for (List<ApexTestQueueItem> jobTests : groupedTestsByJob.values()){
            if (jobTests == null || jobTests.size() == 0){
                continue;
            }
            Boolean allCompleted = true;
            
            for (ApexTestQueueItem queuedTest : jobTests){
                if (queuedTest.Status != 'Completed' && queuedTest.Status != 'Failed' && queuedTest.Status != 'Aborted'){
                    allCompleted = false;
                    break;
                    System.debug('ApexTestQueueItem'+queuedTest.Status);
                }
            }
            
            if (allCompleted == true){
                completedAsyncJobIds.add(jobTests[0].ParentJobId);
            }
        }
        return completedAsyncJobIds;
    }
    private static void sendTestResultEmail(List<ApexTestResult> jobTestResults){
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        String emailAddress = 'anumanlakadidathu@gmail.com';
        System.debug('email address '+ emailAddress);
        String[] toAddresses = new String[] {emailAddress};
        mail.setToAddresses(toAddresses);
        String emailSubject = 'Apex Unit Test Results ' + String.valueOf(Date.today()); 
        mail.setSubject(emailSubject);
        String testResultEmailbody = getTestResultHtmlEmailBody(jobTestResults);
        mail.setHtmlBody(testResultEmailbody);
        Messaging.sendEmail(new Messaging.Email[] { mail });
        System.debug('message send'+emailSubject);
    }
    private static String getTestResultHtmlEmailBody(List<ApexTestResult> jobTestResults){
        List<ApexTestResult> successTests = new List<ApexTestResult>();
        List<ApexTestResult> failedTests = new List<ApexTestResult>();
        String testResultBody = '';
        for (ApexTestResult jobTestResult : jobTestResults){
            if (jobTestResult.Outcome == 'Pass'){
                successTests.add(jobTestResult);
            }
            else{
                failedTests.add(jobTestResult);
            }
        }
        Integer numTestsRun = successTests.size() + failedTests.size();
        Integer numFailures = failedTests.size();
        Integer successNum = numTestsRun - numFailures;
        
        if (successNum < 0){
            successNum = 0;
        }    
        // Unfortunately, css has to be inlined because many email service providers now exclude external CSS
        // because it can pose a security risk.
        testResultBody += '<table border="1" cellspacing="1" cellpadding="10"><tbody><tr class="firstTr"><td>Tests Run: '+ numTestsRun +'</td></tr><tr><td>Failure Count: '+ numFailures +'</td></tr><tr><td>Success Count:'+ successNum +'</td></tr></tbody></table>';
        if (numFailures > 0){
            testResultBody += '<br/> <br/> <br/>';
            testResultBody += '<table border="1" cellspacing="1" cellpadding="10"><tr>';
            testResultBody += '<th style="text-align: left; padding-left: 5px;">Test Class</th>';
            testResultBody += '<th style="text-align: left; padding-left: 5px;">Unit Test</th>';
            testResultBody += '<th style="text-align: left; padding-left: 5px;">Message</th>';
            testResultBody += '<th style="text-align: left; padding-left: 5px;">Stack Trace</th>';
            testResultBody += '</tr>';
            for (ApexTestResult testFailure : failedTests){
                    testResultBody += '<tr>';                    
                    testResultBody += '<td style="padding: 5px; vertical-align: top;">' + testFailure.ApexClass.Name +'';
                    testResultBody += '<td style="padding: 5px; vertical-align: top;">' + testFailure.MethodName +'';
                    testResultBody += '<td style="padding: 5px; vertical-align: top;">' + testFailure.message +'';
                    testResultBody += '<td style="padding: 5px; vertical-align: top;">' + testFailure.stackTrace +'';                   
                    testResultBody += '</tr>';
            }
            testResultBody += '</table>';
        }       
        return testResultBody;
    }
    // Get the status and pass rate for each class 
    // whose tests were run by the job. 
    // that correspond to the specified job ID. 
    public static List<ApexTestQueueItem> checkClassStatus(Set<ID> jobIds) {
        list<ApexTestQueueItem> items = [SELECT ApexClass.Name, Status,ExtendedStatus,ParentJobId
                                        FROM ApexTestQueueItem 
                                        WHERE ParentJobId in :jobIds];
        for (ApexTestQueueItem item : items) {
            String extStatus = item.extendedstatus == null ? '' : item.extendedStatus;
            System.debug(item.ApexClass.Name + ': ' + item.Status + extStatus);
        }
        return items;
    }
    // Get the result for each test method that was executed. 
    public static List<ApexTestResult> checkMethodStatus(Set<ID> jobIds) {
        list<ApexTestResult> results = [SELECT Outcome,MethodName,Message,StackTrace,AsyncApexJobId, ApexClass.Name,ApexClass.Body,
                                                ApexClass.LengthWithoutComments,ApexClass.NamespacePrefix,ApexClass.Status,ApexLogId,
                                                ApexLog.DurationMilliseconds,ApexLog.Operation,ApexLog.Request,ApexLog.Status,ApexLog.Location,
                                                ApexLog.Application 
                                        FROM ApexTestResult 
                                        WHERE AsyncApexJobId IN :jobIds];
            for (ApexTestResult atr : results) {
            System.debug(atr.ApexClass.Name + '.' + atr.MethodName + ': ' + atr.Outcome);
            if (atr.message != null) {
                System.debug(atr.Message + '\n at ' + atr.StackTrace);
            }
        }
        return results;
    }
}