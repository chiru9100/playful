import { LightningElement ,wire} from 'lwc';
import getFolders from '@salesforce/apex/sendNewEmailApex.getFolders';
import getEmailTemplate from '@salesforce/apex/sendNewEmailApex.getEmailTemplate';
import getObjectEmails from '@salesforce/apex/sendNewEmailApex.getObjectEmails';
import getEmailTempSubject from '@salesforce/apex/sendNewEmailApex.getEmailTempSubject';
import sendEmailToUser from '@salesforce/apex/sendNewEmailApex.sendEmailToUser';


export default class SendNewEmail extends LightningElement {
    get options() {
        return [
            { label: 'Account', value: 'Account' },
            { label: 'Contact', value: 'Contact' }
        ];
    }
    folders;
    selectedObj;
    objData;
    objEmail = [];
    selectedObjEmail;
    handleChange(event){
        this.selectedObj = event.detail.value;
        console.log(' this.selectedObj', this.selectedObj);
        this.handleGetAccounts1();
    }
    handleGetAccounts1(){
    getObjectEmails({selectedObj: this.selectedObj})
    .then((data) =>{
      
       this.objData = data;
       console.log('objData'+JSON.stringify(this.objData));
       let objEmail = [];
       this.objData.forEach(ele=>{
        objEmail.push({label : ele.Email , value : ele.Email});
        console.log('objEmail',objEmail);
       })
       this.objEmail = [...objEmail];
       console.log('this.objEmail',JSON.stringify(this.objEmail));
        
    })
    .catch((error) =>{
        this.error1 = error;
        console.log(' this.error1'+ JSON.stringify(this.error1));


    })
}
handleSelectEmail(event){
    this.selectedObjEmail = event.detail.value;
    console.log('  this.selectedObjEmail',  this.selectedObjEmail);
}

 folders=[];
 folderValues=[];
 selectedFolder;
 emailTemplates= [];
 emailTemplateValues = [];
 selectedEmailTemp;
 error1
 error2;
 error3;
    @wire(getFolders)
    wiredContacts({ error, data }) {
        if (data) {
            let folder = [];
            folder = data;
            console.log('this.folders',folder);
            folder.forEach(ele=>{
                console.log('eleee',ele);
            this.folders.push({label: ele.Name, value: ele.Id});
            console.log('this.folders...',JSON.stringify(this.folders));
            });
            this.folderValues = [...this.folders];
        } else if (error) {
            this.error2 = error;
        }
    }
    handleSelectFolder(event){
        this.selectedFolder = event.detail.value;
        console.log('this.selectedFolder',this.selectedFolder);
        this.handleGetAccounts();
       
    }
    handleGetAccounts(){
    getEmailTemplate({selectedFolder : this.selectedFolder})
    .then((data) =>{
        let emailTemplate = [];
        emailTemplate = data; 
        console.log('this.emailTemplates',emailTemplate);
        emailTemplate.forEach(ele=>{
            console.log('1111111',ele);
            this.emailTemplates.push({label : ele.Name, value :ele.Id})
            console.log('this.emailTemplates',JSON.stringify(this.emailTemplates));
        }) 
        this.emailTemplateValues =[...this.emailTemplates];
        console.log('this.emailTemplateValues',JSON.stringify(this.emailTemplateValues));
    })
    .catch((error) =>{
        this.error3 = error;
    })
   
}
subject;
body;
handleSelectEmailTemp(event){
    this.selectedEmailTemp = event.detail.value;
    console.log(' this.selectedEmailTemp', this.selectedEmailTemp);
    getEmailTempSubject({selectedEmailTemp : this.selectedEmailTemp})
    .then((data) =>{
        this.subject = data[0].Subject;
        console.log('subject',this.subject);
        this.body = data[0].Body;
    })
    .catch((error) =>{
        this.error3 = error;
    })


}
ccEmail;
ccEventHandler(event){
    this.ccEmail = event.target.value;
}
handleCancelHandler(event){
    console.log('1111111111');
    
    
        this.template.querySelectorAll('lightning-input').forEach(element => {
          element.value = null;
        });
        this.template.querySelectorAll('lightning-combobox').forEach(element => {
            element.value = null;
          });
          this.body;
         
}

handleSubmitHandler(event){
    const isInputsCorrect = [
        ...this.template.querySelectorAll("lightning-input,lightning-combobox")
      ].reduce((validSoFar, inputField) => {
        inputField.reportValidity();
        return validSoFar && inputField.checkValidity();
      }, true);


      sendEmailToUser({subject : this.subject,ccEmail : this.ccEmail,body : this.body,toAddress: this.selectedObjEmail})
    .then((data) =>{
        this.subject = data[0].Subject;
        console.log('subject',this.subject);
        this.body = data[0].Body;
    })
    .catch((error) =>{
        this.error3 = error;
    })
}
}