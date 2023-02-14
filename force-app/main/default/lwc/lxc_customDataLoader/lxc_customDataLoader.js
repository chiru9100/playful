/**
 * @File Name          : lxc_customDataLoader.js
 * @Description        : 
 * @Author             : Anup Kage
 * @Group              : 
 * @Last Modified By   : Anup Kage
 * @Last Modified On   : 07-06-2020
 * @Modification Log   : 
 * Ver       Date            Author      		    Modification
 * 1.0    16/6/2020   Anup Kage     Initial Version
**/
import { LightningElement, api, wire,track} from 'lwc';
import mappingFields from '@salesforce/apex/customDataLoaderController.getMappingFields';
import insertRecords from '@salesforce/apex/customDataLoaderController.insertRecords';
import getCSVFileUploadObject from '@salesforce/apex/customDataLoaderController.getCSVFileUploadObject';
import fetchAllRecords from '@salesforce/apex/customDataLoaderController.fetchAllRecords';
import getObjectType from '@salesforce/apex/customDataLoaderController.getObjectType';
import createUpdateMetadata from '@salesforce/apex/CreateUpdateMetadataUtils.createUpdateMetadata';
import getObjFields from '@salesforce/apex/CreateUpdateMetadataUtils.getObjFields';
import getObjFieldsMetadata from '@salesforce/apex/CreateUpdateMetadataUtils.getObjFieldsMetadata';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import uploadFile from '@salesforce/apex/customDataLoaderController.uploadFile';
import getDocumentTypeList from '@salesforce/apex/customDataLoaderController.getDocumentTypeList';
// To Support xlsxc
import { loadScript } from "lightning/platformResourceLoader";
import workbook from "@salesforce/resourceUrl/xlsx"; // https://salesforcelightningweb.com/#multiple-worksheets-in-excel-using-lwc
//import login from '@salesforce/apex/LightningLoginFormController.login';
import getRelatedMetadata from '@salesforce/apex/customDataLoaderController.getRelatedMetadata';



export default class Lxc_customDataLoader extends LightningElement {
	@api recordId;
	@api columnNameByField // Used to Map records fields
	@api objectApiName;
	@api csvApplicationLabel;
	@api csvHeaderLabel;
	@api filterCondition;
	@api filterType;
	
	renderedCallbackRunOnce = false;
	csvObject;
	fileName;
	filesUploaded = [];
	recordsArray;
	errorList = [];
	successList = [];
	errorCSVText;
	successCSVText;
	templateCSVText;
	columnTypeByField;
	enableDropDownBtn = true;
	boxClass;

	MAX_FILE_SIZE;
	MAX_RECORD_SIZE = 200;  // default 200
	ShowProgressResult = false;
	ShowProgressBar = false;
	ShowBothFileOpption = false;
	ShowContentFileOpption = false;
	showDataFileOpption = false;
	isApplicationExists = false;
	isApplication = false;
	showInput = false;
	ShowProgressValue = 0;
	error;
	fileData;
	DropDownValue = [];
	selectDocumentTypeOptions = [];
	contentTypeOfFile;
	isSelectContentFile = false;
	populatingButtonGroup = false;
	showModalNoAppliction = false
	populatingBothButton = false;
	showDownloadOption = false;
	disableDataFile = false;
	uploadedFileNames = [];
	showModalPopup = false;
	filesUploadedlst = [];
	contentFilesUploadedlst = [];
	fileNames = [];
	HilightButton;
    countAllFile;
	isShowSpinner = false;
	isDataTypeDisable = true;
	isContentTypeDisable = true;
	selectedTypeValue;
	showModalForDataFile = false;
	dropDownValues = false;
	showApplication = false;
	objDropDown;
	isTypeListBuilder = false;
	@track clearDocumentType;
	@track includeData = false;
	@api get recordsPerCall() {
		return this.MAX_RECORD_SIZE;
	}
	set recordsPerCall(value) {
		this.MAX_RECORD_SIZE = value;
	}
	@track appLabels= [];
	appName;
	data;
	objApiNames=[];
	// handleUploadFinished(event){
	// 	this.data= event.target.files;
	// 	console.log('this.data');
	// }
	files11=[]
	labelValues = [];
	
	// handleFileUploaded(event){
	// 	this.files11 = event.target.files;
	// 	console.log('this.files11 ',this.files11 );
	// }
	datas;
	@wire(getRelatedMetadata, {recordId: '$recordId' })
	getMetadataObj({ data, error }){
		if (data) {
			let labels = [];
			// let labelValues = [];
			console.log('getting data',data);
			
			let metadata = [];
			//   metadata = data.label;
			// console.log('metadata',metadata);
			labels= data.objLabels;
			console.log('labels',labels);

			labels.forEach(ele => {
				console.log('11111',ele.Label);
				this.labelValues.push({label: ele.Label, value : ele.Label})
				

			})
			this.appLabels = [{label:'Create New Template', value:'new'}, ...this.labelValues];
			console.log('appLabels',JSON.stringify(this.appLabels));
			// console.log('aaaaaaaaa',this.appLabels.value);

        } else if (error) {
			console.log(' this.error ', this.error );
        }
	}
	@track selectedValue;

	selectedFileName;
	handleAppValue(event){
		this.selectedValue = event.target.value;
		console.log('this.selectedValue ',this.selectedValue );
		// console.log('11111111111',JSON.stringify(this.labelValues));

		
		// console.log('this.selectedValue ',event.currentTarget.datase.name);
		// this.selectedApiName = this.objApiNames[ele.dataset.name]
		// console.log('this.selectedApiName',this.selectedApiName);
		if(this.selectedValue==='new'){
			this.showApplication = true;
			
		}else{
			mappingFields( { csvObjectLabel: this.selectedValue })
			.then(result => {
				
	
							console.log('result.....',result);

							if (result) {
								this.isApplicationExists = result.isApplicationExists;
								// console.log('this==>',this.isApplicationExists);
								// if(this.isApplicationExists){
								// 	this.showModalForDataFile = true;
									//  this.showModalNoAppliction = true;
									console.log('isApplicationExists===>',this.isApplicationExists);
									this.includeData = result.includeData;
									this.columnTypeByField = JSON.parse(result.mapOfColumnType);
									console.log('ShowBothFileOpption==>', result.showBothFileOpption);
									console.log('showDataFileOpption==>', result.showDataFileOpption);
									console.log('ShowContentFileOpption==>', result.showContentFileOpption);
									this.columnNameByField = result.mapOfColumnName;
									console.log('this.columnNameByField',JSON.stringify(this.columnNameByField));
									// this.ShowBothFileOpption = result.showBothFileOpption;
									// this.ShowContentFileOpption = result.showContentFileOpption;
									// this.showDataFileOpption = result.showDataFileOpption;
									//this.documentTypeList =  result.data.documentTypeLst;
									// this.createTemplateForUpload();
			// }
			// else{
			// 	// this.showDataFileOpption = true;
			//  }
		} 
		// else if (result.error) {
		// 	this.error = result.error;
		// 	this.ShowErrorToastMessage(result.error);
		// }
	})
	.catch(error => {
		console.error('error11---->', JSON.parse(JSON.stringify(error)))
		this.error = error;
			this.ShowErrorToastMessage(error);
	});

	
						getCSVFileUploadObject({ csvObjectLabel: this.selectedValue  })
						.then(result => {
							console.log('result',result);
								if (result) {
									console.log('aaaaaaaaaaaaaa',result);
									this.csvObject = result;
									console.log('this.csvObject',this.csvObject);
								}
								// else if (result) {
								// 	console.error('error11---->', JSON.parse(JSON.stringify(result)))
								// 	this.ShowErrorToastMessage(result);
								// 	this.error = result;
								// }
									
				       })
						.catch(error => {
							console.error('error11---->', JSON.parse(JSON.stringify(error)))
							this.ShowErrorToastMessage(error);
							this.error = error;
						});
				
	// 		mappingFields( { csvObjectLabel: this.selectedValue })
	// 		.then(result => {
				
	
	// 	console.log('result.....',result);

	// 	if (result.data) {
	// 		this.isApplicationExists = result.data.isApplicationExists;
	// 		console.log('this==>',this.isApplicationExists);
	// 		if(this.isApplicationExists){
	// 			this.showModalNoAppliction = true;
	// 			console.log('isApplicationExists===>',this.isApplicationExists);
	// 			this.includeData = result.data.includeData;
	// 			this.columnTypeByField = JSON.parse(result.data.mapOfColumnType);
	// 			console.log('ShowBothFileOpption==>', result.data.showBothFileOpption);
	// 			console.log('showDataFileOpption==>', result.data.showDataFileOpption);
	// 			console.log('ShowContentFileOpption==>', result.data.showContentFileOpption);
	// 			this.columnNameByField = result.data.mapOfColumnName;
	// 			console.log('this.columnNameByField',JSON.stringify(this.columnNameByField));
	// 			this.ShowBothFileOpption = result.data.showBothFileOpption;
	// 			this.ShowContentFileOpption = result.data.showContentFileOpption;
	// 			this.showDataFileOpption = result.data.showDataFileOpption;
	// 			//this.documentTypeList =  result.data.documentTypeLst;
	// 			this.createTemplateForUpload();
	// 		}
	// 		else{
	// 			this.showDataFileOpption = true;
	// 		}
	// 	} else if (result.error) {
	// 		this.error = result.error;
	// 		this.ShowErrorToastMessage(result.error);
	// 	}
	// })
	// 		 this.csvObject = this.selectedValue;
		}
		console.log('csvObjectzzzzzzzzzzzz',this.csvObject);
	}
	handleEnteredApp(event){
		this.appName = event.target.value;
	}

	@wire(mappingFields, { csvObjectLabel: '$csvApplicationLabel' })
	fieldsRecords(result)
	{
		console.log('result.....',result.data);

		if (result.data) {
			this.isApplicationExists = result.data.isApplicationExists;
			console.log('this==>',this.isApplicationExists);
			if(this.isApplicationExists){
				this.showModalNoAppliction = true;
				console.log('isApplicationExists===>',this.isApplicationExists);
				this.includeData = result.data.includeData;
				this.columnTypeByField = JSON.parse(result.data.mapOfColumnType);
				console.log('ShowBothFileOpption==>', result.data.showBothFileOpption);
				console.log('showDataFileOpption==>', result.data.showDataFileOpption);
				console.log('ShowContentFileOpption==>', result.data.showContentFileOpption);
				this.columnNameByField = result.data.mapOfColumnName;
				console.log('this.columnNameByField',JSON.stringify(this.columnNameByField));
				this.ShowBothFileOpption = result.data.showBothFileOpption;
				this.ShowContentFileOpption = result.data.showContentFileOpption;
				this.showDataFileOpption = result.data.showDataFileOpption;
				//this.documentTypeList =  result.data.documentTypeLst;
				this.createTemplateForUpload();
			}
			else{
				this.showDataFileOpption = true;
			}
		} else if (result.error) {
			this.error = result.error;
			this.ShowErrorToastMessage(result.error);
		}
	}
	files=[];
	contentFiles = [];
	isModalPopUpOpen= false;
	showModalForDataFiles = false;
	
	handleFileUploadApp(event){

	// 	this.inputData= true;
	// this.inputContent = false;
	console.log('this.selectedValue',this.selectedValue);
	if(this.selectedValue == null){
		console.log('inside of if condition');
	const All_Compobox_Valid = [...this.template.querySelectorAll('lightning-combobox')]
            .reduce((validSoFar, input_Field_Reference) => {
                input_Field_Reference.reportValidity();
                return validSoFar && input_Field_Reference.checkValidity();
            }, true);
			this.selectTemplate();

		}else{

		
    //   if(!this.isApplicationExists){
	// 		this.showModalNoAppliction = true;
	// 	}
		this.files = event.target.files;
		console.log('this.files',this.files);
		
		for(var i=0; i< event.target.files.length; i++){
			
			// const All_Compobox_Valid = [...this.template.querySelectorAll('lightning-combobox')]
            // .reduce((validSoFar, input_Field_Reference) => {
            //     input_Field_Reference.reportValidity();
            //     return validSoFar && input_Field_Reference.checkValidity();
            // }, true);
			let file = event.target.files[i];
			var createdId = 'file'+i;
			var databtnid = 'DataBtnId'+i;
			var conBtnId = 'conBtnId'+i;
			this.dataFileName = event.target.files[i].name;
			console.log('this.dataFileName',this.dataFileName);
			let contenttype = event.target.files[i].name.split('.').pop().toLowerCase();
			console.log('contenttype',JSON.stringify(contenttype));
			// let inputCmp = this.template.querySelector("label[for='file-upload-input-1111']");
			// console.log('inputCmp',inputCmp);
			
			if ( contenttype === 'csv' || contenttype === 'xls' || contenttype === 'xlsm' || contenttype === 'xlsx' || contenttype === 'xlt' ) {
				this.filesUploaded.push(event.target.files[i]);
				// this.isDataTypeDisable = false;
				// this.isContentTypeDisable = true;
				// inputCmp.setCustomValidity(""); // if there was a custom error before, reset it
				this.showModalForDataFiles = true;
				this.readAllData();
				//  this.readExcelFile();
				console.log('inside of if');
			}
			else{
				console.log('inside of else');
				// this.isDataTypeDisable = true;
				// this.isContentTypeDisable = false;
				this.showDataError();

			}
				
			
		}
	 }

	}

	// inputContent = false;
	contentFileNames = [];
	UploadFileNames = [];

	handleFileUploadContent(event){
		
		console.log('this.selectedValue',this.selectedValue);
		if(this.selectedValue == null){
			console.log('inside of if condition');
		const All_Compobox_Valid = [...this.template.querySelectorAll('lightning-combobox')]
				.reduce((validSoFar, input_Field_Reference) => {
					input_Field_Reference.reportValidity();
					return validSoFar && input_Field_Reference.checkValidity();
				}, true);
				this.selectTemplate();
	
			}else{
	
			
		// this.inputData = false;
		// this.inputContent= true;
		this.contentFiles = event.target.files;
		console.log('this.contentFile',this.contentFiles);
		for(var i=0; i< event.target.files.length; i++){
			let file = event.target.files[i];
			var createdId = 'file'+i;
			console.log('file',file);
			var databtnid = 'DataBtnId'+i;
			console.log('file',databtnid);

			var conBtnId = 'conBtnId'+i;
			console.log('file',conBtnId);
			this.contentFileNames = event.target.files[i].name;
			console.log('this.contentFileNames',this.contentFileNames);
			let contenttype = event.target.files[i].name.split('.').pop().toLowerCase();
			console.log('contenttype',JSON.stringify(contenttype));
			// let inputCmp = this.template.querySelector("label[for='file-upload-input-1111']");
			// console.log('inputCmp',inputCmp);
			
			if ( contenttype === 'png'|| contenttype === 'pdf') {
				// inputCmp.setCustomValidity(""); // if there was a custom error before, reset it
				this.UploadFileNames.push({Name : this.contentFileNames})
				console.log('inside of if');

				getDocumentTypeList({csvObjectLabel: this.selectedValue})
				.then(result => {
					console.log('result',result);
						if (result) {
							console.log('data----> ',data);

				for(var i=0;i<data.length;i++){
					console.log('list----> ',data[i]);
					this.selectDocumentTypeOptions.push({'label': data[i],
															'value': data[i]});
					
					console.log('selectDocumentTypeOptions----> ',this.selectDocumentTypeOptions);
				};
						}
						// else if (result) {
						// 	console.error('error11---->', JSON.parse(JSON.stringify(result)))
						// 	this.ShowErrorToastMessage(result);
						// 	this.error = result;
						// }
							
			   })
				.catch(error => {
					console.error(error);
				});

				// this.isModalPopUpOpen = true;
				// console.log('inside of if');
			}
			else{
				console.log('inside of else');
				this.showError();

			}
				

		}
		console.log('this.UploadFileNames11',JSON.stringify(this.UploadFileNames));
	}
	console.log('this.UploadFileNames',JSON.stringify(this.UploadFileNames));

	}
	handleChange(event) {
		
		let selectDropDownValue = event.target.value;
		this.selectedTypeValue = selectDropDownValue;
		console.log('selectDropDownValue>>>>>>', selectDropDownValue);
		//console.log('bw: id = ' + event.currentTarget.id);
		// output: bw: id = undefined
		console.log('bw: id = ' + event.currentTarget.dataset.id);
		for (let i = 0; i < this.uploadedFileNames.length; i++) {
			if(this.uploadedFileNames[i].id == event.currentTarget.dataset.id){
				for(let j = 0; j < this.DropDownValue.length; j++){
					console.log('this.DropDownValue[j] = ' , this.DropDownValue[j]['fileName']);
					if(this.DropDownValue[j]['fileName'] == this.uploadedFileNames[i].Name){
						this.DropDownValue.pop(j);	
					}	
				}
				this.DropDownValue.push({fileName: this.uploadedFileNames[i].Name, type: selectDropDownValue});
			}

		}
		/*if(!this.DropDownValue.includes(selectDropDownValue)){
			this.DropDownValue.push(selectDropDownValue);
		}*/
		console.log('Dropdownvalues>>>>>>',this.DropDownValue);
    }
	closeModalPop(event){
		console.log('close the modal ');
		this.isModalPopUpOpen = false;
	}

	selectTemplate() {
        const evt = new ShowToastEvent({
           
            message: 'select the template',
            variant: 'error',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
	}
	showDataError() {
        const evt = new ShowToastEvent({
            title: 'Error',
            message: 'will  access csv files,xls,xlsm,xlt',
            variant: 'error',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }
	showError() {
        const evt = new ShowToastEvent({
            title: 'Error',
            message: 'will not access csv files',
            variant: 'error',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
    }
	@wire(getCSVFileUploadObject, { csvObjectLabel:  '$csvApplicationLabel' })
	objectData(result) {
		console.log('result',result);
		if (result.data) {
			this.csvObject = result.data;
			console.log('this.csvObject',this.csvObject);
		}
		else if (result.error) {
			console.error('error11---->', JSON.parse(JSON.stringify(result.error)))
			this.ShowErrorToastMessage(result.error);
			this.error = result.error;
		}
	}
	@wire(getDocumentTypeList, {csvObjectLabel: '$csvApplicationLabel'})
		lists({ error, data }) {
			if (data) {
				console.log('data----> ',data);

				for(var i=0;i<data.length;i++){
					console.log('list----> ',data[i]);
					this.selectDocumentTypeOptions.push({'label': data[i],
															'value': data[i]});
					
					console.log('selectDocumentTypeOptions----> ',this.selectDocumentTypeOptions);
				}
			} else if (error) {
				console.error(error);
			}
		}
	renderedCallback() {

		Promise.all([loadScript(this, workbook + "/xlsx.full.min.js")])
			.then(() => {
				console.log("success");
			})
			.catch(error => {
				console.error("failure", JSON.parse(JSON.stringify(error)));
			});

		let element = this.template.querySelector("lightning-input[data-id='fileUploader']");
		if (element !== null && element !== undefined && !this.renderedCallbackRunOnce) {
			let style = document.createElement('style');
			style.innerText = `drop_zone-lxc_custom-data-loader .slds-file-selector__body {
				height: 5vh;
				padding: 0%;
			 }`;
			element.appendChild(style);
			this.renderedCallbackRunOnce = true;
		}
	}
	
	handleFileUpload(event) {
		if(!this.isApplicationExists){
			this.showModalNoAppliction = true;
		}
         console.log('inside handleFileUpload',event.target.files);
		console.log('event.target.files.length------- ', event.target.files.lenght);
		 var dataFileName = '';
		for(var i=0; i< event.target.files.length; i++){
			let file = event.target.files[i];
			var createdId = 'file'+i;
			var databtnid = 'DataBtnId'+i;
			var conBtnId = 'conBtnId'+i;
			
			if(this.ShowBothFileOpption){
				this.populatingButtonGroup = true;
				this.populatingBothButton = true;
				this.fileNames = event.target.files[i].name;
				
			}
			console.log('this.fileNames,,,,,,,,,,,,,,,',JSON.stringify(this.fileNames));
			let contenttype = event.target.files[i].name.split('.').pop().toLowerCase();
			console.log('contenttype',contenttype);
			let inputCmp = this.template.querySelector("lightning-input[data-id='fileUploader']");
			
			this.contentTypeOfFile = contenttype;
			
			this.showDownloadOption = false;

			this.showModalPopup = true;// For Enable Model Popup
			
			if (contenttype === 'csv' || contenttype === 'xls' || contenttype === 'xlsm' || contenttype === 'xlsx' || contenttype === 'xlt') {
				inputCmp.setCustomValidity(""); // if there was a custom error before, reset it
				this.isDataTypeDisable = false;
				this.isContentTypeDisable = true;
			}
			else{
				this.isDataTypeDisable = true;
				this.isContentTypeDisable = false;
			}
			console.log('aaaaaaaaaaaaaaaa',file.name);
			this.uploadedFileNames.push({Name: file.name, id:createdId,DataBtnId:databtnid, ConBtnId:conBtnId, isDataDisable:this.isDataTypeDisable, isContentDisable:this.isContentTypeDisable});
			console.log('uploadedFileNames----- ', JSON.stringify(this.uploadedFileNames));
		
			// if(this.ShowBothFileOpption || this.showContentFileOpption){
			// 	this.handleContentFileUpload(event);//
			// }
			if(this.ShowBothFileOpption || this.showDataFileOpption){
				inputCmp.reportValidity();
				if (contenttype === 'csv') {
					console.log('------csv------');
					//this.fileName = event.target.files[0].name;
					this.filesUploaded.push(event.target.files[i]);
					if( event.target.files.length-1 != i){
						dataFileName += event.target.files[i].name +', ';
					}else{
						dataFileName += event.target.files[i].name ;
					}
					
					if(this.ShowBothFileOpption == false &&  this.showDataFileOpption == true){
						this.readAllData();
						this.showModalForDataFile = true;
					}
					//this.readAllData();
				} 
				else if (contenttype === 'xls' || contenttype === 'xlsm' || contenttype === 'xlsx' || contenttype === 'xlt') {
					console.log('------ ',contenttype+' -------',event.target.files[0].name );
					console.log('----files--length-------',event.target.files.length );
					if( event.target.files.length-1 != i){
						dataFileName += event.target.files[i].name +', ';
					}else{
						dataFileName += event.target.files[i].name ;
					}
					
					
					this.filesUploaded.push(event.target.files[i]);
					if(this.ShowBothFileOpption == false &&  this.showDataFileOpption == true){
						this.readExcelFile();
						this.showModalForDataFile = true;
					}
					//this.readExcelFile();
				}
				else{
					console.log('------diff file------');
					this.contentFilesUploadedlst.push(event.target.files[i]);
					this.handleContentFileUpload();
				}
			}
		}
		//console.log('------dataFileName------------------',dataFileName);
		this.fileName = dataFileName;
	}

	handleContentFileUpload() {
		console.log('handleContentFileUpload====195 ',this.contentFilesUploadedlst.length);
		// if (event.target.files.length > 0) {
			// this.ShowProgressBar = false;
			// this.isSelectContentFile = true;
			console.log('filesUploadedlstupdates 12==== ',this.filesUploadedlst);
            for(var i=0; i< this.contentFilesUploadedlst.length; i++){
                let file =this.contentFilesUploadedlst[i];
                let reader = new FileReader();
				
                reader.onload = e => {
				
                    let base64 = 'base64,';
                    let content = reader.result.indexOf(base64) + base64.length;
                    let fileContents = reader.result.substring(content);
                    this.filesUploadedlst.push({PathOnClient: file.name, Title: file.name, VersionData: fileContents});

                };
                reader.readAsDataURL(file);
            }
			if(this.ShowBothFileOpption == false &&  this.showDataFileOpption == true){
				this.showErrorToast();
			}
    }
    insertContentFile(){
		console.log('filesUploadedlstupdates8==== ',this.filesUploadedlst);
		console.log('filesUploadedlstupdates8 length==== ',this.filesUploadedlst.length);
		console.log('selectedTypeValue ',this.selectedTypeValue);
				uploadFile({files: this.filesUploadedlst,recordId: this.recordId, csvObjectLabel:this.csvApplicationLabel,contentDocumentType:JSON.stringify(this.DropDownValue)})
					.then(result => {
						this.isShowSpinner = true;
						this.showSucessToast();
						this.filesUploadedlst = [];
						this.contentFilesUploadedlst = [];
						this.DropDownValue = [];
						window.location.reload();						
					})
					.catch(error => {
						console.log('error===> ',error);
						this.filesUploadedlst = [];
						this.contentFilesUploadedlst = [];
						this.DropDownValue = [];
						// this.isSelectContentFile = false;
						// this.populatingButtonGroup = false;
						// this.populatingBothButton = false;
						// this.showErrorToast(this.comboBOXIDuploadedFileNames.toString());
						// this.enableDropDownBtn = true;
					});
	}
	/**
	 * Read CSV FILE 
	 */
	readAllData() {
		//var allText = new Array();
		var dataAdd = [] ;
		let allText;
		console.log('----length--- ',this.filesUploaded.length);
		for (let i = 0 ,p = Promise.resolve(); i <  this.filesUploaded.length; i++) {	
			let file = this.filesUploaded[i];
			p = p.then(_ => new Promise(resolve => {
				//console.log('i---- ',i);
				this.fileReader = new FileReader();
				this.fileReader.onloadend = (() => {
					 allText = this.fileReader.result;
					console.log('----allText---- ',allText);
					resolve(allText);
					this.convertCSVDataIntoObject(allText);
				});
				
					this.fileReader.readAsText(file);
					
				
				}
			));
			
		}
	}
	
	readExcelFile() {
		const XLSX = window.XLSX;
		let self = this;
		var reader = new FileReader();

		reader.onload = function (e) {
			console.log('---reader.onload---');
			var data = e.target.result;
			var workbook = XLSX.read(data, {
				type: 'binary'
			});

			workbook.SheetNames.forEach(function (sheetName) {
				var XL_row_toCSV = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
				self.convertCSVDataIntoObject(XL_row_toCSV);
			})
		};

		reader.onerror = function (ex) {
			console.error(ex)
		};
		let fileContentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
		let convertFileToBlob = new Blob(this.filesUploaded, {type: fileContentType}); //converting .xlsx file to blob
		reader.readAsBinaryString(convertFileToBlob);
	}

	TableData = [];
	csvColumns = [];
	convertCSVDataIntoObject(allText) {
		let headers;
		console.log('===convertCSVDataIntoObject===');
		let allTextLines = this.CSVToArray(allText, ',');
		console.log('allTextLines111',JSON.stringify(allTextLines));
		this.csvColumns = [...allTextLines[0]];
		console.log('allTextLines',JSON.stringify(allTextLines));
		 headers = allTextLines[0]; 
		 console.log('allTextLines[0]',JSON.stringify(allTextLines[0]));
		console.log('headers',JSON.stringify(headers));// get header
		let columnNameByField = this.columnNameByField;
		console.log('columnNameByField',columnNameByField);
		let columnTypeByField = this.columnTypeByField;
		let recordsArray = [], arrayCount = 0;
		let lines = [];
		const csvObject = this.csvObject;
		console.log('csvObject',this.csvObject);
		let errorList = [];
		this.countAllFile =  allTextLines.length;
		// Inside validate the required fields.
		
		for (let i = 1; i < allTextLines.length; i++) {
			console.log('inside of forloop');
			let valueOfallTextLines = allTextLines[i];
			var str = '';
			var data = [];
			var firstQuote = 0;
			valueOfallTextLines.forEach(ele => {
				if (ele.startsWith('"')) {
					str = str + ele.replace('"', '');// replacing from starting only
					firstQuote = 1;
				}
				else if (ele.endsWith('"')) {
					str = str + ',' + ele.replace('"', '');// replacing from Ending only
					firstQuote = 0;
				}
				else if (firstQuote === 1) {
					str = str + ',' + ele; //adding middle value only 
				}
				else {
					str = ele;
				}

				if (firstQuote === 0) {
					data.push(str);
					str = '';
					console.log('data',JSON.stringify(data));
				}
			})

			if (data.length == headers.length) {
				console.log('aaaaaaaaaa');
				console.log('headers.length',headers.length);
				let record = {};
				record.attributes = {};
				console.log('aaaaaaaaaa');

				record.attributes.type = csvObject.Object_API_Name__c;
				console.log('.........');
				console.log('.........',this.csvObject);

				if (csvObject.Parent_Record_Id__c) {
					record[csvObject.Parent_Record_Id__c.toLowerCase()] = this.recordId;
				}
				let countforBlankRecords = 0; // To find the end of csv file
				let isRequiredError = false;
                 console.log('befor for');
				for (let j = 0; j < headers.length; j++) {
					console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaa',headers[j]);
					if (data[j] == '' || data[j] == undefined || data[j] == null) {
						console.log('ddd');
						countforBlankRecords++;
					}
					const headerName = headers[j].toLowerCase();
					console.log('headerName.......',headerName);
					let field = columnNameByField[headerName];
					// console.log('');
					console.log('field....',field);
					// console.log('field.............',columnNameByField);

					if (field) {
						console.log('aaaa');
						if (field.Required__c && (data[j] == undefined || data[j] == null || data[j] == '')) {
							console.log(' if');
							isRequiredError = true;
							record.ErrorMessage = 'Required Field Value is missing: ' + field.Field_API_Name__c;
						} else {
							console.log('else ');
							console.log('field: ' + field.Field_API_Name__c + '; value: ' + data[j]);
							switch (columnTypeByField[headerName]) {
								case 'BOOLEAN':
									if (data[j].toLowerCase() == 'true' || data[j] == 1) {
										record[field.Field_API_Name__c.toLowerCase()] = true;
									} else if (data[j].toLowerCase() == 'false' || data[j] == 0) {
										record[field.Field_API_Name__c.toLowerCase()] = false;
									}
									else {
										record[field.Field_API_Name__c.toLowerCase()] = null;
									}
									break;
								case 'DATE':
									if(data[j] != undefined){
										try{
											let dtVale = new Date(data[j]);
											record[field.Field_API_Name__c.toLowerCase()] = dtVale.getFullYear()+'-'+(dtVale.getMonth()+1)+'-'+dtVale.getDate();
										}catch(de){
											
										}
									}
									break;
								case 'DATETIME':
									if(data[j] != undefined){
										try{
											let dtVale = new Date(data[j]);
											record[field.Field_API_Name__c.toLowerCase()] = dtVale.getFullYear()+'-'+(dtVale.getMonth()+1)+'-'+dtVale.getDate()+'T'
																									+dtVale.getHours()+':'+dtVale.getMinutes()+':'+dtVale.getSeconds()+'.'+dtVale.getMilliseconds();
										}catch(de){
											
										}
									}
									break;
								default:
									record[field.Field_API_Name__c.toLowerCase()] = data[j];
									break;
							}
						}
					} else if (headerName == 'id' && data[j] !== '' && data[j] !== null && data[j] != undefined) {
						console.log('else if');
						record['id'] = data[j];
					}
					console.log('->>>', JSON.stringify(record));
				}
				console.log('isRequiredError',isRequiredError);

				console.log('->>>', JSON.stringify(record));
				if (headers.length === countforBlankRecords) {
					console.log('headers.length',headers.length);
					console.log('countforBlankRecords',countforBlankRecords);  //on end of csv file
					break;
				}
				console.log('isRequiredError',isRequiredError);
				if (!isRequiredError) {
					console.log('if isRequiredError');
					lines.push(record); 
					console.log('lines......',lines);// upload list
				} else {
					console.log('else isRequiredError');
					errorList.push(record); // ERROR list
				}
				console.log('errorlist 426------ ',JSON.stringify(this.errorList));
			}

			// recordsArray is used to set how many itrations required to insert all records. 
			// EX inserting 500 records and MAX_RECORD_SIZE= 200. then it contains 3 rows. each row contions max 200 records.
			console.log('this.MAX_RECORD_SIZE',this.MAX_RECORD_SIZE);
			if (lines.length === this.MAX_RECORD_SIZE) {
				console.log('lines.length ',lines.length );
				console.log('lines.length ',this.MAX_RECORD_SIZE );
				recordsArray[arrayCount] = lines;
				lines = [];
				arrayCount++;
			}
		}
		// if records are less then Max size
		console.log('before of lines.length',lines.length);
		if (lines.length > 0) {
			console.log('lines.length,,,,,,,,,,,,,,,,,',lines.length);
			recordsArray[arrayCount] = lines;
			lines = [];
		}
		
		this.recordsArray = recordsArray;
		console.log('this.recordsArray',JSON.stringify(this.recordsArray));
		this.setupProgressBar();
		this.errorList = errorList;
		if (this.recordsArray.length === 0) {
			console.log('end alllllll');
			this.endAllProcess();
		} else {
			console.log('perform dml');
			this.performDMLAction()
		}
	}
	/*
		using promise we are calling apex class and passing records,
	*/
	performDMLAction() {
		console.log('====performDMLAction======');
		let recordsArray = this.recordsArray;
		console.log('recordsArray',this.recordsArray);
		let self = this;
		let breakOnError = false;
			for (let i = 0, p = Promise.resolve(); i < recordsArray.length && !breakOnError; i++) {
				p = p.then(_ => new Promise(resolve => {
					// let isError = false;
					insertRecords({ recordList: JSON.stringify(recordsArray[i]), objectApiName: this.csvObject.Object_API_Name__c })
						.then(data => {
							console.log('data......',data);
							 self.handleResponse(data);
							 self.calculateProgress(i + 1);
							// this.populatingButtonGroup = false;
							// this.populatingBothButton = false;
							this.filesUploaded = [];
							// this.filesUploadedlst = [];
							//this.recordsArray = null;
							
							resolve();
						}).catch(error => {
							// breakOnError = true;
							// self.ShowErrorToastMessage(error);
							// this.populatingButtonGroup = false;
							// this.populatingBothButton = false;
							 this.recordsArray = null;
							 this.filesUploaded = [];
							// this.filesUploadedlst = [];
							// let message = error.body.message;
							// self.resetFileUploader();
							self.calculateProgress(i + 1);
							
							resolve();
							// p.reject();
							// isError = true;
							// break;	
						})
				}
				));
			}
	}
	calculateProgress(count) {
		console.log('Inside calculateProgress=== ',count);
		console.log('Inside calculateProgress=== ', this.recordsArray);

		this.ShowProgressValue = Math.floor((count / this.recordsArray.length) * 100);
		console.log('Inside calculateProgress=== ',this.ShowProgressValue);
		if (this.ShowProgressValue >= 100) {
			this.endAllProcess();
		}
		this.showDownloadOption = this.errorCSVText ? true : (this.successCSVText ? true : false);
		console.log('this.showDownloadOption',this.showDownloadOption);
	}
	endAllProcess() {
		this.showToast();
		this.resetFileUploader();
		this.dispatchEvent(new CustomEvent('customrefresh'));
	}
	resetFileUploader() {
		this.errorCSVText = this.convertArrayOfObjectsToCSV(this.errorList);
		this.successCSVText = this.convertArrayOfObjectsToCSV(this.successList);
	}
	setupProgressBar() {
		console.log('INside setupProgressBar');
		this.errorList = [];
		this.successList = [];
		//this.template.querySelector('lightning-input').disabled = true;
		this.ShowProgressResult = true;
		this.ShowProgressBar = true;
		this.ShowProgressValue = 0;
		this.errorCSVText = null;
		this.successCSVText = null;
	}
	handleResponse(data) {
		if (data.errorRecordList.length > 0) {
			this.errorList = this.errorList.concat(data.errorRecordList);
		}
		if (data.successRecordList.length > 0) {
			this.successList = this.successList.concat(data.successRecordList);
		}
		
	}
	convertArrayOfObjectsToCSV(responseList) {
		//console.log('responseList',JSON.stringify(responseList));
		// declare variables
		var csvStringResult, counter, keys, columnDivider, lineDivider;

		// check if "objectRecords" parameter is null, then return from function
		if (responseList == null || !responseList.length) {
			
			return null;
		}
		// store ,[comma] in columnDivider variabel for sparate CSV values and 
		// for start next line use '\n' [new line] in lineDivider varaible  
		columnDivider = ',';
		lineDivider = '\n';
		let record = responseList[0];
		//console.log('record',JSON.stringify(record));
		let objKeys = Object.keys(record);
		//console.log('objKeys',JSON.stringify(objKeys));
		keys = objKeys.filter(e => e !== 'attributes');
		//console.log('keys',JSON.stringify(keys));


		// in the keys valirable store fields API Names as a key 
		// this labels use in CSV file header  
		// keys = ['FirstName', 'LastName', 'Department', 'MobilePhone', 'Id'];

		csvStringResult = '';
		csvStringResult += keys.join(columnDivider);
		//console.log('csvStringResult',csvStringResult);
		csvStringResult += lineDivider;
		//console.log('csvStringResult',csvStringResult);

		for (var i = 0; i < responseList.length; i++) {
			counter = 0;

			for (var sTempkey in keys) {
				var skey = keys[sTempkey];

				// add , [comma] after every String value,. [except first]
				if (counter > 0) {
					csvStringResult += columnDivider;
				}
				csvStringResult += '"' + responseList[i][skey] + '"';
				counter++;

			} // inner for loop close 
			csvStringResult += lineDivider;
		}// outer main for loop close 

		// return the CSV formate String 
		return csvStringResult;
	}
	downloadSuccessCSV(event) {
		this.downloadCSVFile(this.successCSVText, 'SuccessExportData.csv');
		// var hiddenElement = document.createElement('a');
		// hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(this.successCSVText);
		// hiddenElement.target = '_self'; // 
		// hiddenElement.download = 'SuccessExportData.csv';  // CSV file Name* you can change it.[only name not .csv] 
		// document.body.appendChild(hiddenElement); // Required for FireFox browser
		// hiddenElement.click(); // using click() js function to download csv file
	}
	downloadErrorCSV(event) {
		this.downloadCSVFile(this.errorCSVText, 'ErrorExportData.csv');
		// var hiddenElement = document.createElement('a');
		// hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(this.errorCSVText);
		// hiddenElement.target = '_self'; // 
		// // let fileName = 'ErrorExportData' + new Date() ;
		// hiddenElement.download = 'ErrorExportData.csv';  // CSV file Name* you can change it.[only name not .csv] 
		// document.body.appendChild(hiddenElement); // Required for FireFox browser
		// hiddenElement.click(); // using click() js function to download csv file
	}
	showToast() {
		let type = 'success'
		if (this.errorList.lenght > 0 && this.successList.length === 0) {
			type = 'error'
		}
		let strmessage = 'Data Insertion Completed. Success: ' + this.successList.length + ' Error: ' + this.errorList.length;
		console.log('ERROR=====',JSON.stringify(this.errorList));
		console.log('successList=====',JSON.stringify(this.successList));

		let totalSizeOfSucessndError = this.successList.length +  this.errorList.length;
		console.log('totalSizeOfSucessndError',totalSizeOfSucessndError);
		console.log('countAllFile---> ',this.countAllFile);
		console.log('totalSizeOfSucessndError---> ',totalSizeOfSucessndError);
		if(this.countAllFile == totalSizeOfSucessndError){
		    const event = new ShowToastEvent({
		       	message: strmessage,
			    variant: type,
			    mode: 'dismissable'
		    });
		    this.dispatchEvent(event);
	    }
		console.log('showToast,,,,,,,,,,');
	}
	ShowErrorToastMessage(error) {
		console.log('error---> ',error);
		this.dispatchEvent(new CustomEvent('customrefresh'));
		const event = new ShowToastEvent({
			message: error.body.message,
			variant: 'error',
			mode: 'dismissable'
		});
		this.dispatchEvent(event);
	}
	createTemplateForUpload() {
		let keys = Object.keys(JSON.stringify(this.columnNameByField));
		  
		//console.log('columnNameByField---', this.columnNameByField);
		//console.log('keys---',JSON.stringify(keys));
		let dummyList = [];
		let record = {};
		keys.forEach(key => {
			record[key] = '';
		});
		dummyList.push(record);
		//console.log('dummyList',JSON.stringify(dummyList));
		//Check order on dumylist if we are getting correct order then task is done else We have to write a sorting  code in js
		this.templateCSVText = this.convertArrayOfObjectsToCSV(dummyList);
		//console.log('this.templateCSVText',this.templateCSVText);

	}
		
	downloadtemplateCSV(event) {
		let elementIncludeData = this.template.querySelector("lightning-input[data-name='IncludeData']")
		if (this.filterType != 'None' && elementIncludeData && elementIncludeData.checked) {
			fetchAllRecords({ csvObjectLabel: this.csvApplicationLabel, filterType: this.filterType, filterCondition: this.filterCondition, recordId: this.recordId })
				.then(result => {
					this.downloadCSVFile(result, 'templateUpload.csv');
				}).catch(error => {
					this.ShowErrorToastMessage(error);
				});
		} else {
			
			this.downloadCSVFile(this.templateCSVText, 'templateUpload.csv');
		}
	}
	downloadCSVFile(filedata, fileName) {
		var hiddenElement = document.createElement('a');
		hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(filedata);
		hiddenElement.target = '_self'; // 
		hiddenElement.download = fileName;  // CSV file Name* you can change it.[only name not .csv] 
		document.body.appendChild(hiddenElement); // Required for FireFox browser
		hiddenElement.click(); // using click() js function to download csv file
	}
	get showDownloadDataCheckbox() {
		return this.filterType !== 'None';
	}

	/**
	 * CSVToArray parses any String of Data including '\r' '\n' characters,
	 * and returns an array with the rows of data.
	 * @param {String} CSV_string - the CSV string you need to parse
	 * @param {String} delimiter - the delimeter used to separate fields of data
	 * @returns {Array} rows - rows of CSV where first row are column headers
	 * https://stackoverflow.com/questions/36288375/how-to-parse-csv-data-that-contains-newlines-in-field-using-javascript
	*/
	
	CSVToArray(CSV_string, delimiter) {
		delimiter = (delimiter || ","); // user-supplied delimeter or default comma

		var pattern = new RegExp( // regular expression to parse the CSV values.
			( // Delimiters:
				"(\\" + delimiter + "|\\r?\\n|\\r|^)" +
				// Quoted fields.
				"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
				// Standard fields.
				"([^\"\\" + delimiter + "\\r\\n]*))"
			), "gi"
		);

		var rows = [[]];  // array to hold our data. First row is column headers.
		// array to hold our individual pattern matching groups:
		var matches = false; // false if we don't find any matches
		// Loop until we no longer find a regular expression match
		while (matches = pattern.exec(CSV_string)) {
			var matched_delimiter = matches[1]; // Get the matched delimiter
			// Check if the delimiter has a length (and is not the start of string)
			// and if it matches field delimiter. If not, it is a row delimiter.
			if (matched_delimiter.length && matched_delimiter !== delimiter) {
				// Since this is a new row of data, add an empty row to the array.
				rows.push([]);
			}
			var matched_value;
			// Once we have eliminated the delimiter, check to see
			// what kind of value was captured (quoted or unquoted):
			if (matches[2]) { // found quoted value. unescape any double quotes.
				matched_value = matches[2].replace(
					new RegExp("\"\"", "g"), "\""
				);
			} else { // found a non-quoted value
				matched_value = matches[3];
			}
			// Now that we have our value string, let's add
			// it to the data array.
			rows[rows.length - 1].push(matched_value);
		}
		return rows; // Return the parsed data Array
	}

	
	handleUploadFiles() {
		console.log('==handleUploadFiles==');
		let allValid = [...this.template.querySelectorAll('lightning-combobox')]
            .reduce((validSoFar, inputFld) => {
                inputFld.reportValidity();
                return validSoFar && inputFld.checkValidity();
            }, true);
		// console.log('filesUploaded==== 642 ',this.filesUploaded.length);
		console.log('contentFilesUploadedlst====  ',this.contentFilesUploadedlst.length);
		let dataFilesLength = this.filesUploaded.length;
		console.log('dataFilesLength==== ',dataFilesLength);
		if(dataFilesLength > 0 && allValid === true){
			for(let i=1;i <= dataFilesLength; i++){
				console.log('=======',i)
				if(this.contentTypeOfFile === 'xls' || this.contentTypeOfFile === 'xlsm' || this.contentTypeOfFile === 'xlsx' || this.contentTypeOfFile === 'xlt'){
					console.log('----reading excel file')
					this.readExcelFile();
				}
				if(this.contentTypeOfFile === 'csv'){
					console.log('-----reading all data')
					this.readAllData();
				}
			}
		}
		console.log('--allValid.checked----',allValid)
		if(this.contentFilesUploadedlst.length > 0 && allValid === true){
			console.log('selectedTypeValue======',this.selectedTypeValue);
			if(this.selectedTypeValue){
				this.insertContentFile();
				 
			}
		}
	}
	showSucessToast() {
		let type = 'success'
		let strmessage = ' File was uploaded successfully';
		const event = new ShowToastEvent({
			message: strmessage,
			variant: type,
			mode: 'dismissable',
			
		});
		this.dispatchEvent(event);
		//this.isShowSpinner = true;
	}

	showErrorToast() {
		let type = 'error'
		let strmessage = 'Files was Not uploaded successfully';
		const event = new ShowToastEvent({
			message: strmessage,
			variant: type,
			mode: 'dismissable'
		});
		this.dispatchEvent(event);
	}
	handleDataFiles(event){
		var contentFileBTNId = event.target.value;
		
		var comboBOXID = this.template.querySelector("lightning-combobox[data-id='"+contentFileBTNId+"']");
		comboBOXID.disabled = true;
		comboBOXID.value = null;
		
		//Changing bg-color Of Button Group
		var contentBtnId = event.currentTarget.dataset.difid;
		console.log('contentBtnId ', contentBtnId);
		var contentFileBtnUncheck = this.template.querySelector("[data-btnid='"+contentBtnId+"']");
		console.log('contentFileBtnUncheck ', contentFileBtnUncheck);
		contentFileBtnUncheck.checked = false;

	}
	handleContentFiles(event){
		console.log('handleContentFiles----------------- ');
		
		var contentFileBTNId = event.target.value;//event.currentTarget.dataset.ConBtnId;
		
		var comboBOXID = this.template.querySelector("lightning-combobox[data-id='"+contentFileBTNId+"']");
		comboBOXID.disabled = false;
		
		//Changing bg-color Of Button Group
		var dataFileBtnId = event.currentTarget.dataset.difid;
		console.log('dataFileBtnId 1', dataFileBtnId);
		var dataFileBtnUncheck = this.template.querySelector("[data-btnid='"+dataFileBtnId+"']");
		console.log('dataFileBtnUncheck 1', dataFileBtnUncheck);
		dataFileBtnUncheck.checked = false;
	}
	
	
	showErrorToastForSelectCorrectFile() {
		let type = 'error'
		let strmessage =  'Please select content File';
		const event = new ShowToastEvent({
			message: strmessage,
			variant: type,
			mode: 'dismissable'
		});
		this.dispatchEvent(event);
	}

	showSucessToastMetadata() {
		let type = 'success'
		let strmessage = ' template created successfully';
		const event = new ShowToastEvent({
			message: strmessage,
			variant: type,
			mode: 'dismissable',
			
		});
		this.dispatchEvent(event);
	}
	closeModal() {    
        // to close modal window set showModalPopup value as false
        this.showModalPopup = false;
		this.populatingButtonGroup = false;
		this.ShowProgressResult = false;
		this.uploadedFileNames = [];
		this.filesUploaded = [];
		this.contentFilesUploadedlst = [];
		this.showModalForDataFile = false;
		this.showModalNoAppliction = false;
		this.csvColumns = [];
		this.TableData = [];

    }

	handleOpenMdtTable(){
		this.showModalNoAppliction = false;
		this.showModalPopup = false;
		this.showApplication = true;
	}

	handleCloseModalApp(){
		this.showModalNoAppliction = false;
	}

	handleCloseModal(){
		this.showApplication = false;
	}

	handleRecord(event){
		console.log('event--',event.target.value);
	}
	
	objectValues = [];
	isReadOnly = false;
	handleClick(){
		this.dropDownValues = true;
		this.isTypeListBuilder = true;
		// this.inputClass = 'slds-has-focus';
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus slds-is-open';
		getObjectType({recordId : this.recordId})
		.then(result =>{
			console.log('result123===>',result);
			if(result === 'Account'){
				this.objDropDown = [{label : 'Account', iconName : 'standard:account'},{label : 'Contact', iconName : 'standard:contact'},{label : 'Opportunity', iconName : 'standard:opportunity'}]
			}
			console.log('dropDownValues--',JSON.stringify(this.objDropDown));    
		}).catch(error =>{
			console.log('error',error);
		})

		
	}
	valueObj;
	isValue;
	dataTable = false;
	@track boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';

	objFields = [];
	selectedIcon;
	async onSelect(event){
		this.isShowSaveButton = true;
		console.log('onselect--');
		this.isremovedDuplicate = true;
		console.log('dropDownValues--',JSON.stringify(this.objDropDown));  
		this.dropDownValues = false;
		this.dataTable = true;
		let ele = event.currentTarget;
		let selectedName = ele.dataset.name;
		//console.log('ele--',JSON.stringify(selectedId));
		this.valueObj = selectedName;		
		console.log('selectedName--',selectedName);
		this.objFields = await this.getFields(this.valueObj);
		console.log('objFields: '+this.objFields); //[]
		this.isValue = false;
		console.log('------',this.csvColumns);
		this.csvColumns.forEach(col =>{
			let obj = {};
			obj.column = col; 
			if(this.objFields.includes(col)){
				console.log('inside iff');
				obj.field = col;
				obj.isSelected = false;
			}
			this.TableData.push(obj);
		});
		console.log('tabledata----982222222222222222222',JSON.stringify(this.TableData));
		this.objDropDown.forEach(ele=>{
			console.log('for each',JSON.stringify(ele));
			  if(ele.label == selectedName)
			  {
				 this.selectedIcon = ele.iconName;
			  }
		  })
		  console.log('icon Name .............',this.selectedIcon);
		if(this.isShowPill){
            this.isValue = false;
        }else{
            this.isValue = true;
        }
	
		
		this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
		
	}
	isShowSaveButton = false;
	fieldAPIName;
	fieldLables;
	lookupObjects;
	removedDuplicate= []

	isremovedDuplicate = false;
	// displayLookupHandler(event){
	// 	this.isremovedDuplicate = true;
	// }
	value;
	lookupId;
	handleChangelookup(event){
		this.value = event.target.value;
		console.log('this.value',this.value);
         this.lookupId = this.value +'Id';
		 console.log(' this.lookupId', this.lookupId);

		
	}
	async getFields(){
		let fields = [];
		let b = [];
		let a = [];
		await getObjFields({objectName : this.valueObj})
		.then(result =>{
			let lookupObj = []
			
			console.log('fields result--0000345',result.allFields);
			console.log('fields result--0000',result.allLabels);
			//console.log('fields result--11111',result.lookup.replace(/[{()}]/g, ''));
			this.lookupObjects = result.lookup
			console.log('fields result--1111',this.lookupObjects);
			this.lookupObjects.forEach(ele=>{
				console.log('ele',ele);

				console.log('this.objvalue',this.valueObj);
				b = ele.replace(/[{()}]/g, '');
				let obj={label : b, value : b}
				console.log('obj',JSON.stringify(obj));
				if(b !== this.valueObj && !a.includes(b) ){
					console.log('b......................',b);
					a.push(b);
					
					lookupObj.push(obj);
					
				}

			})
			this.removedDuplicate = [...lookupObj]
			console.log('a',JSON.stringify(a));
			console.log('this.removedDuplicate',JSON.stringify(this.removedDuplicate));
			console.log('this.lookupObjects',this.lookupObjects.lookup);
			fields = [...result.allLabels]
			this.fieldLables = result.allLabels;
			console.log('this.fieldData............... ',JSON.stringify(this.fieldLables));
			this.fieldAPIName = result.allFields;
			console.log('fieldAPIName.......................'+JSON.stringify(this.fieldAPIName));
			
		}).catch(error =>{
			console.log('fields error--',error);
		});
		return fields;

	}
	get getLookups(){
		console.log('getLookups ',JSON.stringify(this.removedDuplicate));
		return this.removedDuplicate;
	}
	handleRemovePill() {
        if(this.isRemovePill){
			
            console.log('in romove pill--');
			
        }else{
            console.log('in else remove--');
            this.isValue = false;
			this.dataTable = false;
			this.TableData = [];
			this.fields = [];
			
        }
    }

	labelValue;
	metaDataApplication = [];
	metaDataObject = [];
	metaDataField = [];
	
	objMeta = [];
	objMetaValues = [];
	objMetaDataObj = [];
	objMetaObjValues = [];
	isSpinner = false
	async handleSaveTable(){
		this.isSpinner=true;
		console.log('in handle save--');
		await getObjFieldsMetadata({objectName : ['Application__mdt', 'CSV_File_Upload_Object__mdt', 'CSV_File_Upload_Field__mdt']})
		.then(result =>{
			console.log('res== in meta data',result);
			this.metaDataApplication = result['Application__mdt'];
			console.log('metaDataApplication===',this.metaDataApplication);
			this.metaDataApplication.forEach(ele => {
				if(ele != 'id' && ele != 'developername' && ele != 'masterlabel' && ele != 'namespaceprefix' && ele != 'language' && ele != 'qualifiedapiname' && ele != 'label' ){
					let metaDataApp = {};
					metaDataApp = ele;
					this.objMeta.push(metaDataApp);
				}
			}) 
		
			this.objMeta.forEach(fieldApis =>{
				console.log('fieldApis==',fieldApis);
				this.objMetaValues.push({[fieldApis] : this.valueObj});
				console.log('objMetaValues--',JSON.stringify(this.objMetaValues));
			})
			
			this.metaDataObject = result['CSV_File_Upload_Object__mdt'];
			console.log('this.metaDataObject'+this.metaDataObject);
			this.metaDataField = result['CSV_File_Upload_Field__mdt'];
			
		}).catch(error =>{
			

			this.isSpinner = false;
			console.log('error',error);
		})
			
		this.labelValue = this.csvApplicationLabel.replace(' ','_');
		console.log('label----------------Value---');
		console.log('labelValue---',this.labelValue);
		console.log('this.........objMetaValues--',JSON.stringify(this.objMetaValues));
		await createUpdateMetadata({fullName :'Application.'+this.labelValue, label : this.labelValue, fieldWithValuesMap : this.objMetaValues})
		.then(result =>{
			console.log('result---123',result);
			if(result){
				console.log('before calling the method')
			
			}
			console.log('.........................................');
		}).catch(error =>{
			console.log('error--',error);
			console.log('insideeee......error------',error);
		});

		await this.handleMetaData();
		
	}

	
	 async handleMetaData(){
		console.log('satrt the handle metadata method');
		console.log('this.metaDataObject11111'+this.metaDataObject);
		this.metaDataObject.forEach(ele => {
			if(ele != 'id' && ele != 'developername' && ele != 'masterlabel' && ele != 'namespaceprefix' && ele != 'language' && ele != 'qualifiedapiname' && ele != 'label'
			 ){
				let metaDataObj = {};
				metaDataObj = ele;
				console.log('metaDataObj.........................'+metaDataObj);
				this.objMetaDataObj.push(metaDataObj);
			}
		}) 
		console.log('this.objMetaDataObj'+this.objMetaDataObj);
		this.labelValue = this.csvApplicationLabel.replace(' ','_');
		console.log('this.labelValue.........',this.labelValue);
		console.log('this.this.lookupId.........',this.lookupId);

		this.objMetaDataObj.forEach(bb =>{
			console.log('fieldApis==',bb);
			
			if(bb == 'application__c'){
				console.log('inside of application__c');
				this.objMetaObjValues.push({[bb] : this.labelValue});
				console.log('this.objMetaObjValues',JSON.stringify(this.objMetaObjValues));
			}else if(bb == 'parent_record_id__c'){
				console.log('inside of parent record id');
				this.objMetaObjValues.push({[bb] : this.lookupId});
				console.log('inside of parent record id',JSON.stringify(this.objMetaObjValues));

			}
			else {
				console.log('inside of else--');

				this.objMetaObjValues.push({[bb] : this.valueObj});
				console.log('objMetaValues--',JSON.stringify(this.objMetaObjValues));
			}
			
			
		})
		// var map = {Object_Label__c: this.valueObj, Object_API_Name__c: this.valueObj, Parent_Record_Id__c: this.valueObj, Application__c : this.labelValue};
		// 	console.log('this.newmap===',map);
		
		console.log('this.labelValue111',this.labelValue);
		console.log('this.objMetaDataObj',JSON.stringify(this.objMetaObjValues));

		console.log('before of the second apex method');
		await createUpdateMetadata({fullName :'CSV_File_Upload_Object.'+this.labelValue, label : this.labelValue, fieldWithValuesMap : this.objMetaObjValues})
		.then(result =>{
			console.log('result123-----123',result);
			
		}).catch(error =>{
			this.isSpinner = false;
			console.log('error123--',error);
		})
		await this.handleMetaDataUpdate();
	}
	//selectedColoumn = [];
	 metadataObjFields=[];	 
	 objMetaDataColum = [];
	 fullName=[];
	// metadataObjFieldsApi=[];
	 async handleMetaDataUpdate(){
		console.log('in handle upload field----');
		//console.log('this.selectedNameValue....',this.selectedNameValue);
		this.labelValue = this.csvApplicationLabel.replace(' ','_');
		console.log('this.labelValue',this.labelValue);
		this.metaDataField.forEach(metaField=>{
			if(metaField != 'id' && metaField != 'developername' && metaField != 'masterlabel' && metaField != 'namespaceprefix' && metaField != 'language' && metaField != 'qualifiedapiname' && metaField != 'label'
			 && metaField != 'sequence__c'){
				let metaDataObjField=[];
				 metaDataObjField = metaField;
				 console.log('metaDataObjField',JSON.stringify(metaDataObjField))
				 this.metadataObjFields.push(metaDataObjField);
			}
		})
		var metadataObjFieldsApis1 = [];
		this.TableData.forEach(d =>{
				//console.log('inside if')
				let obj = {};
				 this.metadataObjFields.forEach(recapi=>{
					//console.log('inside hhhhhhhh');
					obj[[recapi]]  = d.field;
					console.log('objjjjjjj',JSON.stringify(obj));
					if(!metadataObjFieldsApis1.includes(obj) && recapi =='csv_file_upload_object__c'){
						console.log('inside id .....');
						obj[[recapi]]  = this.labelValue;
						
					}
					if(recapi == 'required__c'){
						console.log('inside reruired if ........',recapi);
						obj[[recapi]]  = d.requried ;
						//console.log('out side  reruired if ........',d.requried);

					}
				
				})
				metadataObjFieldsApis1.push(obj)
				console.log('metadataObjFieldsApis1',JSON.stringify(metadataObjFieldsApis1));
				//let objMetaDataColum = {}
			//objMetaDataColum = d.column;
			//this.objMetaDataColum.push(objMetaDataColum);
			//console.log('	this.objMetaDataColum' ,JSON.stringify(this.objMetaDataColum));
			//this.metadataObjFieldsApis1.push({[recapi] : d.field})
			//console.log('this.metadataObjFieldsApis1',this.metadataObjFieldsApis1)
			createUpdateMetadata({fullName :'CSV_File_Upload_Field.'+d.column, label : d.column, fieldWithValuesMap : metadataObjFieldsApis1})
			.then(result =>{
				console.log('resu---123',result);
				
					this.isSpinner = false;
					this.showSucessToastMetadata();
				
			}).catch(error =>{
				this.isSpinner = false;
				console.log('error--',error);
			})

		//console.log('this.metadataObjFieldsApis111111111',JSON.stringify(this.metadataObjFieldsApis1));
		// this.objMetaDataColum.forEach(dd=>{
		// 	let dada=[]
		// 	dada = 'CSV_File_Upload_Field.'+dd;
		// 	console.log('dadaaaaaaa',dada);
		// 	this.fullName.push(dada);
		// })
		// console.log('fullName',this.fullName)
		 
		// this.TableData.forEach(element =>{
		// 	console.log('elememt==',element);
		// 	var map = {CSV_Column_Name__c: element.field, Field_API_Name__c: element.field, Field_Label__c: element.field, Required__c: this.valueCheck, CSV_File_Upload_Object__c : this.labelValue };
		// 	console.log('this.newmap===',map);
		// 	//var labelValue = this.csvApplicationLabel.replace(' ','_');
		})
		console.log('metadataObjFieldsApis1................',JSON.stringify(metadataObjFieldsApis1));
	
		
	}

	dropDownFields = false;
	isTypeList = false;
	fields = [];
	//fieldResult = false;
	objName = [];
	isremovedDuplicate = false
	handleInput(event){
		console.log('in handle input--');
		this.objName = event.currentTarget.dataset.id;
		this.dropDownFields = true;
		this.isTypeList = true;
		this.dataTable = true;
		this.inputClass = 'slds-has-focus';
        this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus slds-is-open';
		
	    this.fields = [];
		
		this.TableData.forEach(el =>{
			el.isSelected = false;
			
			
		})

			for(let i = 0; i < 5; i++){
				console.log('inside for loop ',this.objFields[i]);
				this.fields.push({label :this.objFields[i]});
				//console.log('fields',this.fields.label);

			}
			console.log('fields=================',JSON.stringify(this.fields));
		this.TableData.forEach(el =>{
			if(el.column == this.objName){

				el.isSelected = true;
			}
		})
		
		console.log('fields=================',JSON.stringify(this.fields));
		
	}

	
	valueField = [];
	isValueTable = false;
	selectedNameValue=[];
	selectedItem;
	onSelectValue(event){
		console.log('in onselect---');
		this.dropDownValues = false;
		this.dropDownFields = true; 
		this.isTypeList = true;
		
		this.selectedItem = event.currentTarget.dataset.name;
		console.log('this.selectedItem',this.selectedItem);
		let ele = event.currentTarget;
		
		let selectedName = this.fieldAPIName[ele.dataset.name];
		console.log('this.selectedNameValue....',this.selectedNameValue);
		console.log('selectedName==',selectedName);
		this.selectedNameValue= selectedName;
		console.log('this.selectedNameValue',this.selectedNameValue);
		let keys = Object.keys(this.fieldAPIName);
		
		console.log('selectedkeys==',JSON.stringify(keys));

		let selectedLabel = keys[event.currentTarget.dataset.name];
		 console.log('selectedLabel............',selectedLabel);
		let selectedId = ele.dataset.id;
		console.log('selectedId=====',selectedId);
		this.TableData.forEach(d =>{
			if(d.column === selectedId){
				d.field = selectedName;
				d.inputVal = this.selectedItem;
				d.isSelected = false;
			}
		})
		console.log(this.TableData);
		//this.template.querySelectorAll('lightning-input[data-id]').forEach(each => {each.value = '';});
		this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus';
	}

	onChange(event) {
        // this.searchField = event.target.value;  
		this.removedDuplicate=[];
		let searchVal = event.target.value;
		let selectedId = event.currentTarget.dataset.id;
		console.log('selectedId in onchage event',selectedId);
		
		console.log('this.searchField==',searchVal);
		var ff = [];
	     
		for(let i = 0; i < this.objFields.length; i++){
			
			if(this.objFields[i].startsWith(searchVal) == true && searchVal != ''){
				

				ff.push({ label :this.objFields[i]});
			}
		}
		this.fields = ff;
		
		console.log('this.fields'+this.fields);
		if(searchVal == ''){
			console.log('inside of searchVal ');
			this.selectedNameValue=[];
			console.log('this.selectedNameValue',JSON.stringify(this.selectedNameValue));
			this.TableData.forEach(d =>{
				if(d.column === selectedId){
					console.log('aaaaaaaaaaaa');
					d.field = this.selectedNameValue;
					// d.inputVal = this.selectedItem;
					// d.isSelected = false;
				}
			})
		}

    }
	selectedReqField ;
	handleTodoChange(event) {
		this.selectedReqField = event.currentTarget.dataset.id;
	console.log('selectedReqField',this.selectedReqField);
		if(this.valueField !== ''){
			this.valueCheck = event.target.checked;        
			console.log("TodoCheck: " + this.valueCheck);
		}
		this.TableData.forEach(el =>{
			if(el.column == this.selectedReqField){
				console.log('inside if condition');

				el.requried = this.valueCheck ;
			}
		})
		console.log('this.TableData.requried....................',JSON.stringify(this.TableData));

	}

	blurTimeout;
	selectedColumn
	inBlur(){
		console.log('inblue===');

		this.selectedColumn = event.currentTarget.dataset.id;
		let column = this.TableData;
		console.log('inblue===',JSON.stringify(this.selectedColumn));

		column.forEach(el=>{
			
			if(el.column==this.selectedColumn ){
				console.log('dddddddddd');
			   el.isSelected=false;	
			}
			el.isSelected=true;	
		})
	 this.TableData = column;

		// this.TableData.forEach(el =>{
		// 	console.log('onblor colum');
		// 	if(el.column == this.selectedColumn ){
        //        el.isSelected =false;
		// 	}

		// 	 })
		console.log('inblue===');
		this.dataTable = true;  
		this.blurTimeout = setTimeout(() =>  {this.boxClass = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-has-focus'}, 300);
	}
}