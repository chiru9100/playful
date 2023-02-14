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
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import uploadFile from '@salesforce/apex/customDataLoaderController.uploadFile';
import getDocumentTypeList from '@salesforce/apex/customDataLoaderController.getDocumentTypeList';
import getObjectType from '@salesforce/apex/customDataLoaderController.getObjectType';		//DROP-026
import getObjFields from '@salesforce/apex/customDataLoaderController.getObjFields';
import createCustomMdt from '@salesforce/apex/customMetadataUtils.createUpdateMetadata';	//DROP-026
import checkDeploymentStatus from '@salesforce/apex/customMetadataUtils.checkDeploymentStatus';
import getUploadApplicationRecords from '@salesforce/apex/customDataLoaderController.getUploadApplicationRecords';
// To Support xlsxc
import { loadScript } from "lightning/platformResourceLoader";
import workbook from "@salesforce/resourceUrl/xlsx"; // https://salesforcelightningweb.com/#multiple-worksheets-in-excel-using-lwc
import CompanySignedDate from '@salesforce/schema/Contract.CompanySignedDate';




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

	MAX_FILE_SIZE;
	MAX_RECORD_SIZE = 200;  // default 200
	ShowProgressResult = false;
	ShowProgressBar = false;
	showDataFileOpption = false;
	ShowProgressValue = 0;
	error;
	fileData;
	DropDownValue = [];
	selectDocumentTypeOptions = [];
	contentTypeOfFile;
	isSelectContentFile = false;
	populatingButtonGroup = false;
	
	populatingBothButton = false;
	showDownloadOption = false;
	disableDataFile = false;
	uploadedFileNames = [];
	showModalPopup = false;
	filesUploadedlst = [];
	contentFilesUploadedlst = [];
	fileNames = [];
    countAllFile;
	isDataTypeDisable = true;
	isContentTypeDisable = true;
	selectedTypeValue;
	@track clearDocumentType;
	@track includeData = false;

	/* DROP-026 */
	isApplicationExists = false;
    fileUploaded = false;
    uploadSelected = false;
    recordContext = false;
	@api get recordsPerCall() {
		return this.MAX_RECORD_SIZE;
	}
	set recordsPerCall(value) {
		this.MAX_RECORD_SIZE = value;
	}
	@wire(mappingFields, { csvObjectLabel: '$csvApplicationLabel' })
	fieldsRecords(result) {
		console.log('mappingFields ',result);
		if (result.data) {
			console.log('isApplicationExists: ',result.data.isApplicationExists);
			this.isApplicationExists = result.data.isApplicationExists;
			if(this.isApplicationExists){
				this.includeData = result.data.includeData;
				this.columnTypeByField = JSON.parse(result.data.mapOfColumnType);
				console.log('columnTypeByField: ', JSON.stringify(this.columnTypeByField));
				/* console.log('showDataFileOpption==>', result.data.showDataFileOpption); */
				this.columnNameByField = result.data.mapOfColumnName;
				console.log('columnNameByField: ', this.columnNameByField);
				this.showDataFileOpption = result.data.showDataFileOpption;
				//this.documentTypeList =  result.data.documentTypeLst;
				this.createTemplateForUpload();
			}else if(!this.isApplicationExists){
			}
		} else if (result.error) {
			this.error = result.error;
			this.ShowErrorToastMessage(result.error);
		}
	}
	@wire(getCSVFileUploadObject, { csvObjectLabel: '$csvApplicationLabel' })
	objectData(result) {
		console.log('getCSVFileUploadObject ',result);
		if (result.data) {
			this.csvObject = result.data;
		}
		else if (result.error) {
			console.error('error---->', JSON.parse(JSON.stringify(result.error)))
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

	uploadApps = [];
	@wire(getUploadApplicationRecords, { recordId : '$recordId'})
	getUploadApplications({data, error}){
        console.log('getUploadApplications ',data);
		if(data){
			var uploadApps = [];
			data.forEach(item =>{
				uploadApps.push({label: item, value : item})
			});
			this.uploadApps = [{label: 'Create New Template', value : 'new'}, ...uploadApps];
		}else if(error){
			console.log('getUploadApplicationRecords ',error);
		}
	}

	get getUploadApps(){
		return this.uploadApps;
	}

	selectCsvApplicationLabel(event){
		if(event.detail.value === 'new'){
			// this.createUploadTemplate();
            this.isApplicationExists = false;
		}else{
			this.csvApplicationLabel = event.detail.value;
		}
        this.uploadSelected = true;
	}

    connectedCallback(){
        this.recordContext = (this.recordId !== undefined && this.recordId !== 'None') ? true : false;
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
        // this.template.querySelector(".tempBox").focus();
	}
	
	csvCols = [];
	handleFileUpload(event) {
        console.log('inside handleFileUpload',event.target.files);
        var dataFileName = '';
        this.template.querySelector(".tempBox").reportValidity();
		for(var i=0; i< event.target.files.length; i++){
			/* let file = event.target.files[i];
			var createdId = 'file'+i;
			var databtnid = 'DataBtnId'+i;
			var conBtnId = 'conBtnId'+i; */
			
				this.populatingButtonGroup = true;
				this.populatingBothButton = true;
				this.fileNames = event.target.files[i].name;
			
			let contenttype = event.target.files[i].name.split('.').pop().toLowerCase();
			let inputCmp = this.template.querySelector("lightning-input[data-id='fileUploader']");
			this.contentTypeOfFile = contenttype;
			
			this.showDownloadOption = false;


			if (contenttype === 'csv' || contenttype === 'xls' || contenttype === 'xlsm' || contenttype === 'xlsx' || contenttype === 'xlt') {
                if(this.uploadSelected){
                    inputCmp.setCustomValidity(""); // if there was a custom error before, reset it
                    // this.isDataTypeDisable = false;
                    // this.isContentTypeDisable = true;
                }else{
                    this.displayToast('error', 'Please select an upload template!');
                    return;
                }
			}else{
                this.displayToast('error', 'Data upload files must be .csv, .xls, .xlsx format');
                return;
				/* this.isDataTypeDisable = true;
				this.isContentTypeDisable = false; */
			}
			/* this.uploadedFileNames.push({Name: file.name, id:createdId,DataBtnId:databtnid, ConBtnId:conBtnId, isDataDisable:this.isDataTypeDisable, isContentDisable:this.isContentTypeDisable});
			console.log('uploadedFileNames----- ',JSON.stringify(this.uploadedFileNames)); */
		
			
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
					
						this.readAllData();
					// }else if(!this.isApplicationExists){	//DROP-026
					// 	/* let rows =  */this.readAllData();
					// 	/* console.log('rows ',JSON.stringify(rows))
					// 	console.log('rows type ',typeof rows);; */
					// 	// this.csvColumns = [...this.readAllData()];
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
						this.readExcelFile();
					//this.readExcelFile();
				}
				/* else{
					console.log('------diff file------');
					this.contentFilesUploadedlst.push(event.target.files[i]);
					this.handleContentFileUpload();
				} */
		}
		console.log('------dataFileName------------------',dataFileName);
		this.fileName = dataFileName;
	}

	handleContentFileUpload(event) {
        console.log('content file ', event.target.files);
        console.log('content files length ', event.target.files.length);
        if(this.showDataFileOpption){
            this.displayToast('info', 'A Content Upload template has not been defined for the '+this.csvApplicationLabel+'. Please contact your admin');
            // this.displayToast('info', 'The selected '+ this.csvApplicationLabel + ' is not configured for content. Please create content metadata for this application to upload files.');
            return;
        }
        else if(!this.uploadSelected){
            this.displayToast('info', 'Please select an upload template');
            return;
        }
        if(event.target.files.length > 0){
            var fileType;
            for(let i=0; i<event.target.files.length; i++){
                fileType = event.target.files[i].name.split('.').pop().toLowerCase();
                if(fileType === 'csv' || fileType === 'xls' || fileType === 'xlsx' || fileType === 'xlsm'){
                    this.displayToast('error' , 'Content upload files must be .pdf, .text etc...');
                    return;
                }else{
                    let file = event.target.files[i];
			        var createdId = 'file'+i;
			        var databtnid = 'DataBtnId'+i;
			        var conBtnId = 'conBtnId'+i;
                    this.contentFilesUploadedlst.push(event.target.files[i]);
                    this.uploadedFileNames.push({Name: file.name, id:createdId,DataBtnId:databtnid, ConBtnId:conBtnId, isDataDisable:this.isDataTypeDisable, isContentDisable:this.isContentTypeDisable});
			        console.log('uploadedFileNames----- ',JSON.stringify(this.uploadedFileNames));
                }
            }
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
            this.isApplicationExists = true;
            this.populatingBothButton = true;
            this.showModalPopup = true;
        }else{
            
        }
		// if (event.target.files.length > 0) {
			// this.ShowProgressBar = false;
			// this.isSelectContentFile = true;
			
    }

    uploadedFiles = [];
    insertContentFile(){
		console.log('filesUploadedlstupdates8==== ',JSON.stringify(this.filesUploadedlst));
		console.log('filesUploadedlstupdates8 length==== ',this.filesUploadedlst.length);
		console.log('selectedTypeValue ',this.selectedTypeValue);
				uploadFile({files: this.filesUploadedlst,recordId: this.recordId, csvObjectLabel:this.csvApplicationLabel,contentDocumentType:JSON.stringify(this.DropDownValue)})
					.then(result => {
                        /* this.filesUploadedlst.forEach(file =>{
                            this.uploadedFiles.push({fileName : file.Title})
                        }) */
                        this.showModalPopup = false;
						this.showSucessToast();
						this.filesUploadedlst = [];
						this.contentFilesUploadedlst = [];
						this.DropDownValue = [];
                        this.fileUploaded = true;
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
		var rows = [];
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
					if(this.isApplicationExists)
						this.convertCSVDataIntoObject(allText);
					else{
						this.CSVToArray(allText, ',');
						return;
					}	
				});
				
				this.fileReader.readAsText(file);
					
				
			}));
			
		}
		// return rows;
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

	convertCSVDataIntoObject(allText) {
		console.log('===convertCSVDataIntoObject===');
		let allTextLines = this.CSVToArray(allText, ',');
		console.log('allTextLines',JSON.stringify(allTextLines));
		let headers = allTextLines[0]; // get header
		let columnNameByField = this.columnNameByField;
		let columnTypeByField = this.columnTypeByField;
		let recordsArray = [], arrayCount = 0;
		let lines = [];
		const csvObject = this.csvObject;
		let errorList = [];
		this.countAllFile =  allTextLines.length;
		// Inside validate the required fields.
		
		for (let i = 1; i < allTextLines.length; i++) {
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
				}
			})

			if (data.length == headers.length) {
				let record = {};
				record.attributes = {};
				record.attributes.type = csvObject.Drop_Zone__Object_API_Name__c;
				if (csvObject.Drop_Zone__Parent_Record_Id__c) {
					record[csvObject.Drop_Zone__Parent_Record_Id__c.toLowerCase()] = this.recordId;
				}
				let countforBlankRecords = 0; // To find the end of csv file
				let isRequiredError = false;

				for (let j = 0; j < headers.length; j++) {
					if (data[j] == '' || data[j] == undefined || data[j] == null) {
						countforBlankRecords++;
					}
					const headerName = headers[j].toLowerCase();
					let field = columnNameByField[headerName];
					if (field) {
						if (field.Drop_Zone__Required__c && (data[j] == undefined || data[j] == null || data[j] == '')) {
							isRequiredError = true;
							record.ErrorMessage = 'Required Field Value is missing: ' + field.Drop_Zone__Field_API_Name__c;
						} else {
							console.log('field: ' + field.Drop_Zone__Field_API_Name__c + '; value: ' + data[j]);
							switch (columnTypeByField[headerName]) {
								case 'BOOLEAN':
									if (data[j].toLowerCase() == 'true' || data[j] == 1) {
										record[field.Drop_Zone__Field_API_Name__c.toLowerCase()] = true;
									} else if (data[j].toLowerCase() == 'false' || data[j] == 0) {
										record[field.Drop_Zone__Field_API_Name__c.toLowerCase()] = false;
									}
									else {
										record[field.Drop_Zone__Field_API_Name__c.toLowerCase()] = null;
									}
									break;
								case 'DATE':
									if(data[j] != undefined){
										try{
											let dtVale = new Date(data[j]);
											record[field.Drop_Zone__Field_API_Name__c.toLowerCase()] = dtVale.getFullYear()+'-'+(dtVale.getMonth()+1)+'-'+dtVale.getDate();
										}catch(de){
											
										}
									}
									break;
								case 'DATETIME':
									if(data[j] != undefined){
										try{
											let dtVale = new Date(data[j]);
											record[field.Drop_Zone__Field_API_Name__c.toLowerCase()] = dtVale.getFullYear()+'-'+(dtVale.getMonth()+1)+'-'+dtVale.getDate()+'T'
																									+dtVale.getHours()+':'+dtVale.getMinutes()+':'+dtVale.getSeconds()+'.'+dtVale.getMilliseconds();
										}catch(de){
											
										}
									}
									break;
								default:
									record[field.Drop_Zone__Field_API_Name__c.toLowerCase()] = data[j];
									break;
							}
						}
					} else if (headerName == 'id' && data[j] !== '' && data[j] !== null && data[j] != undefined) {
						record['id'] = data[j];
					}
					console.log('->>>', record);
				}

				console.log('->>>', record);
				if (headers.length === countforBlankRecords) {  //on end of csv file
					break;
				}
				if (!isRequiredError) {
					lines.push(record); // upload list
				} else {
					errorList.push(record); // ERROR list
				}
				console.log('errorlist 426------ ', this.errorList)
			}

			// recordsArray is used to set how many itrations required to insert all records. 
			// EX inserting 500 records and MAX_RECORD_SIZE= 200. then it contains 3 rows. each row contions max 200 records.
			if (lines.length === this.MAX_RECORD_SIZE) {
				recordsArray[arrayCount] = lines;
				lines = [];
				arrayCount++;
			}
		}
		// if records are less then Max size
		if (lines.length > 0) {
			recordsArray[arrayCount] = lines;
			lines = [];
		}
		
		this.recordsArray = recordsArray;
		this.setupProgressBar();
		this.errorList = errorList;
		if (this.recordsArray.length === 0) {
			this.endAllProcess();
		} else {
			this.performDMLAction()
		}
	}
	/*
		using promise we are calling apex class and passing records,
	*/
	performDMLAction() {
		console.log('====performDMLAction======');
		let recordsArray = this.recordsArray;
		let self = this;
		let breakOnError = false;
			for (let i = 0, p = Promise.resolve(); i < recordsArray.length && !breakOnError; i++) {
				p = p.then(_ => new Promise(resolve => {
					// let isError = false;
					insertRecords({ recordList: JSON.stringify(recordsArray[i]), objectApiName: this.csvObject.Drop_Zone__Object_API_Name__c })
						.then(data => {
							
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
		this.ShowProgressValue = Math.floor((count / this.recordsArray.length) * 100);
		if (this.ShowProgressValue >= 100) {
			this.endAllProcess();
		}
		this.showDownloadOption = this.errorCSVText ? true : (this.successCSVText ? true : false);
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
		let objKeys = Object.keys(record);
		keys = objKeys.filter(e => e !== 'attributes');
		// in the keys valirable store fields API Names as a key 
		// this labels use in CSV file header  
		// keys = ['FirstName', 'LastName', 'Department', 'MobilePhone', 'Id'];

		csvStringResult = '';
		csvStringResult += keys.join(columnDivider);
		csvStringResult += lineDivider;

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
		console.log('ERROR=====',this.errorList)
		let totalSizeOfSucessndError = this.successList.length +  this.errorList.length;
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
	}
    displayToast(type, message, mode){
        if(!mode) mode = 'dismissable';
        const event = new ShowToastEvent({
            message: message,
            variant: type,
            mode: mode
        });
     this.dispatchEvent(event);
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
		let keys = Object.keys(this.columnNameByField);
		  
		console.log('columnNameByField---', this.columnNameByField);
		console.log('keys---',keys);
		let dummyList = [];
		let record = {};
		keys.forEach(key => {
			record[key] = '';
		});
		dummyList.push(record);
		//Check order on dumylist if we are getting correct order then task is done else We have to write a sorting  code in js
		this.templateCSVText = this.convertArrayOfObjectsToCSV(dummyList);

	}
		
	downloadtemplateCSV(event) {
        if(!this.isApplicationExists){
            this.displayToast('error', 'Please select an upload template!');
            return;
        }
		let elementIncludeData = this.template.querySelector("lightning-input[data-name='IncludeData']")
		if (this.filterType != 'None' && elementIncludeData && elementIncludeData.checked) {
			fetchAllRecords({ csvObjectLabel: this.csvApplicationLabel, filterType: this.filterType, filterCondition: this.filterCondition, recordId: this.recordId })
				.then(result => {
					this.downloadCSVFile(result, 'templateUpload.csv');
				}).catch(error => {
					this.ShowErrorToastMessage(error);
				});
		} else {
			console.log('templateCSVText: ',this.templateCSVText);
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
		this.csvCols = [...rows[0]];	//DROP-026
        if(!this.isApplicationExists){
            this.createUploadTemplate();
        }
		return rows; // Return the parsed data Array
	}

	
	handleUploadFiles() {
		console.log('==handleUploadFiles==');
		if(!this.isApplicationExists){
			this.showModalPopup = true;
			return;
		}
		let allValid = [...this.template.querySelectorAll('lightning-combobox')]
            .reduce((validSoFar, inputFld) => {
                inputFld.reportValidity();
                return validSoFar && inputFld.checkValidity();
            }, true);
		// console.log('filesUploaded==== 642 ',this.filesUploaded.length);
		console.log('contentFilesUploadedlst====  ',this.contentFilesUploadedlst.length);
		let dataFilesLength = this.filesUploaded.length;
		/* console.log('dataFilesLength==== ',dataFilesLength);
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
		} */
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

	closeModal() {    
        this.fileUploaded = false;
        // to close modal window set showModalPopup value as false
        this.showModalPopup = false;
        this.populatingButtonGroup = false;
        this.ShowProgressResult = false;
        this.uploadedFileNames = [];
        this.filesUploaded = [];
        this.contentFilesUploadedlst = [];
    }

	/**DROP-026 */
	objDropDownValues = [];
	openUploadTemplate = false;
	objValue;
	isValue = false;
	iconName;
	isShowList = false;
	showBtn = false;
	parentObj = '';
	tableData = [];
	objFields = [];
	fm;
	lookUpFields = [];
	disObjInput = true;
    objLabel;
	parentLookUp;
	fieldDropDown = [];
	c;
	showTable = false;
	createUploadTemplate(){
		this.openUploadTemplate = true;
		this.getObjectType();
	}
	
	handleInputClick(){
		this.isShowList = true;
		const objInput = this.template.querySelector('.objectSearch');
		if(objInput.value){
			console.log('obj value: ', objInput.value);
		}else{
			
		}	
	}

	handleInputChange(event){
		console.log('obj value: ', event.target.value);
		let v = event.target.value;
	}

	handleInputBlur(event){
		setTimeout(() => {
			this.isShowList = false;
		}, 500);	
	}
	
	async getObjectType(){
		await getObjectType({objId : this.recordId})
		.then(result =>{
            this.parentObj = String(result.label);
			if(result){
				if(result.fieldApiName === 'Account'){
					this.objDropDownValues = [{fieldApiName : result.fieldApiName,iconName : 'standard:account', Id : this.recordId, Label : result.label }, {fieldApiName : 'Contact', iconName : 'standard:contact'}, {fieldApiName : 'Opportunity',iconName : 'standard:opportunity'}];
				}else if(result === 'Contact'){
					this.objDropDownValues = [{fieldApiName : 'Contact', iconName : 'standard:contact', Label : result.label}]
				}else{
					this.objDropDownValues = [{fieldApiName : result.fieldApiName, iconName : 'standard:record_lookup', Label : result.label}];
				}
				this.disObjInput = false;
				const objInput = this.template.querySelector('.objectSearch');
				objInput.focus();
				this.isShowList = true;
			}
		}).catch(error =>{
			console.log('obj error ', error);
			this.ShowErrorToastMessage();
		})
	}

	async onObjectSelect(event){
		this.isShowList = false;
		const element = event.currentTarget;
		this.objValue = element.dataset.name;

		this.objDropDownValues.forEach(obj =>{
			if(obj.fieldApiName === this.objValue){
				this.iconName = obj.iconName;
                this.objLabel = obj.Label;
            }
		});

		this.fm = new Map();
		let objFields = await this.getObjFields(this.objValue, this.parentObj);
		let a = [];
		objFields.forEach(f =>{
			if(f.label || f.fieldApiName){
				this.objFields.push({label : f.label, fieldApiName: f.fieldApiName});
				this.fm.set(f.label, f.fieldApiName);
			}
			if(f.lookUpLabel){
				f.lookUpLabel = f.lookUpLabel.replace(/[{()}]/g, '');
				f.lookUpLabel = f.lookUpLabel.replace(f.lookUpLabel.charAt(0),f.lookUpLabel.charAt(0).toUpperCase());
				f.lookUpLabel = f.lookUpLabel.includes('id') ? f.lookUpLabel.replace('id', 'Id') : f.lookUpLabel;
				var obj = {label : f.lookUpLabel, value : f.lookUpLabel};
				if(f.lookUpLabel !== this.objValue && !a.includes(f.lookUpLabel)){
					a.push(f.lookUpLabel);
					this.lookUpFields.push(obj);
				}
			}
		});
		this.isValue = this.showBtn = true;
		this.tableData = [];
		this.csvCols.forEach(col =>{
			let obj = {column : col.trim(), inpVal : null};
			this.objFields.forEach(f => {
				if(f.label.toLowerCase() === col.toLowerCase() || f.fieldApiName.toLowerCase() === col.toLowerCase()){
					obj.field = f.fieldApiName;
					obj.inpVal = f.label;
				}
			});
			this.tableData.push(obj);
		});
		this.showTable = true;
	}
	
	get lookUpOptions() {
		return this.lookUpFields;
	}

	handleSelectLookup(event){
		this.parentLookUp = event.detail.value;
	}

	async getObjFields(objName, parentObjName){
		let fields = [];
		await getObjFields({objName : objName, parentObjName : parentObjName})
		.then(res =>{
			const columnsToHide = ['developername', 'language', 'namespaceprefix', 'qualifiedapiname', 'masterlabel'];
			res.forEach(r =>{
				if(!columnsToHide.includes(r.label)){
					fields.push({label : r.label , fieldApiName : r.fieldApiName , lookUpLabel : r.lookUpLabel});
				}
			});
		}).catch(error =>{
			console.log('error: ',JSON.stringify(error));
		});
		return fields;
	}
	
	handleFieldInputClick(event){
		let ele = event.currentTarget.dataset.id;
		console.log('ele ',ele);
		console.log('c ',this.c);
		// if(this.c = ele){
			console.log('inside of if');
			// this.c = ele;
			for(let i=0; i<5;i++){
				this.fieldDropDown.push({label : this.objFields[i].label});
			}
			this.fieldDropDown.length = 5;
			let dt = [...this.tableData];
			dt.forEach(d =>{
				if(d.column === ele)
					d.showFields = true;
				else
					d.showFields = false;
			});
			this.tableData = [...dt];
		// }
	}
	
	handleFieldInputChange(event){
		try {
			let i = event.target.value;
			console.log('i',i);
			let e = event.currentTarget.dataset.id;
			this.c = e;
			console.log('this.c in onchange',this.c);
			for(let i=0; i<5;i++){
				this.fieldDropDown.push({label : this.objFields[i].label});
			}
			this.fieldDropDown.length = 5;
			console.log('this.fieldDropDown.length',this.fieldDropDown.length);
			console.log('e',e);
			let g = this.fieldDropDown = [];
			this.objFields.forEach(v => {
				if(v.label.toLowerCase().startsWith(i.toLowerCase()) && !g.includes({label : v.label})){
					g.push({label : v.label});
				}
			});
			if(g.length < 5) {
				this.objFields.forEach(l =>{
					if(l.label.includes(i) && !g.includes({label : l.label})){
						g.push({label : l.label})
					}
				})
			}
			g.length = g.length > 5 ? 5 : g.length;
			this.fieldDropDown = [...g];
			let dt = [...this.tableData];
			dt.forEach(d =>{
				if(d.column === e && i)
					d.showFields = true;
				else if(d.column === e)
					d.field = null;
			});
			this.tableData = [...dt];
		} catch (error) {
			console.error(error);
		}
	}
	
	hanldeFieldInputBlur(event){
		let ele = event.currentTarget.dataset.id;
		console.log('ele on blur',ele);
		
		//  this.template.querySelectorAll('lightning-input').forEach(each => {each.value = '';});
		setTimeout(() => {
			let dt = [...this.tableData];
			dt.forEach(d =>{
				if(d.column === ele){
					console.log('d.column',d.column);
					d.showFields = false;
				}
				// else{
				// 	d.inpVal = '';
				// }
				
			});
			this.tableData = [...dt];
		}, 500);
	}

	onFieldSelect(event){
		console.log('onselect');
		let f = event.currentTarget.dataset.name;
		console.log('f11111111',f);
		let e = event.currentTarget.dataset.id;
		console.log('f    ',e);
		let dt = this.tableData;
		console.log('........',this.c);
		// console.log('this.c1111',this.c);
		dt.forEach(d =>{
			if(d.column === e){
				// console.log('this.c',this.c);
				console.log('in '+ d.column);
				d.showFields = false;
				// d.inpVal = null;
				d.inpVal = f;
				console.log('d.inpVal ',d.inpVal );
				d.field = this.fm.get(f);
			}
		});
		// this.c ='';
		this.tableData = [...dt];
	}

	handleRemovePill(){
		this.objValue = '';
		this.isValue = this.showTable =  false;
		this.tableData = [];
		this.objFields = [];
		this.lookUpFields = []; 
		this.showBtn = false;
	}

	handleRequired(event){
		let val = event.currentTarget.dataset.id;
		let d = this.tableData;
		d.forEach(item =>{
			if(item.column === val){
				item.required = event.target.checked;
			}
		})
		this.tableData = [...d];
	}

	closeUploadTemplate(){
		this.openUploadTemplate = this.showTable = this.isValue = false;
		this.objValue = '';
		this.tableData = [];
		this.lookUpFields = []; 
	}
	
	@api appMdtLabel = 'Drop_Zone__Application__mdt';
	@api fileUploadObjMdt = 'Drop_Zone__CSV_File_Upload_Object__mdt';
	@api fileUploadFieldMdt = 'Drop_Zone__CSV_File_Upload_Field__mdt';
	loadSpinner = false;
	async handleCreateMetadata(){
		let count = 50;
        const templateInput = this.template.querySelector(".tempInp");
        if(!templateInput.checkValidity()){
            templateInput.reportValidity();			//checking template name input field validity
            return;
        }
		this.openUploadTemplate = false;
		this.loadSpinner = true;
		try {
			if(templateInput.value !== null && templateInput.value !== undefined){
                this.csvApplicationLabel = templateInput.value;
            }
			let jobId = await this.createApplicationMdt();
			console.log('jobId ',jobId);
			if(jobId){
				var status = await this.checkDeployment(jobId);
			}
			console.log('app status_1: ',status);
			if(status !== 'succeeded'){
				for(let i=1; i<=count;i++){
					if(status === 'succeeded'){
						break;
					}else if(status === 'pending' || status === 'inprogress'){
						status = await this.checkDeployment(jobId);
					}
				}
			}else if(status === 'failed'){
				this.displayToast('error', 'Failed to create '+this.csvApplicationLabel+ ' template.');
				return;
			}
			console.log('createApplicationMdt deployment status ', status);
			if(status === 'succeeded'){
				status = null;
				var _id = await this.createUploadObjMdt();
				console.log('_id ',_id);
				if(_id){
					status = await this.checkDeployment(_id);
					console.log('obj status_1 ',status);
					if(status !== 'succeeded'){
						for(let i=1;i<=count;i++){
							if(status === 'succeeded'){
								break;
							}else if(status === 'pending' || status === 'inprogress'){
								status = await this.checkDeployment(_id);
							}
						}
					}else if(status === 'failed'){
						this.displayToast('error', 'Error creating '+this.csvApplicationLabel+ ' CSV_File_Upload_Object__mdt.');
						return;
					}
				}
			}
			console.log('createUploadObjMdt deployment status : ',status);
			if(status !== null && status === 'succeeded'){
				await this.createUploadFieldMdt();
			}

			this.closeUploadTemplate();

			this.loadSpinner = false;
		} catch (error) {
			console.log('err '+error);
		}
	}

	async createApplicationMdt(){
		console.log('in createApplicationMdt');
		if(this.objValue){
			let mdtFields = await this.getObjFields(this.appMdtLabel);
			let newMdt = [];
			
			if(mdtFields && mdtFields.length > 0){
				
				mdtFields.forEach(col =>{
					if(col.fieldApiName){
						for(let key in col){
							var obj = {};
							if(col[key] === "Drop_Zone__Object_API_Name__c".toLowerCase()){
								obj[col[key]] = this.objValue;
							}else if(col[key] === "Drop_Zone__Object_Label__c".toLowerCase()){
                                obj[col[key]] = this.objLabel !== undefined ? this.objLabel : this.objValue;
                            }
                            newMdt.push(obj);
						}
					}
				});
				let devName = this.csvApplicationLabel.replaceAll(' ','_');
				var result = await this.createCustomMetadata(this.appMdtLabel, devName, this.csvApplicationLabel, newMdt);	//inserting Application__mdt
			}
		}else{
			let objInput = this.template.querySelector(".objInput");
			objInput.reportValidity();
			setTimeout(() => {
				objInput.focus();
			}, 500);
		}
		return result;
	}

	async createUploadObjMdt(){
		console.log('in createUploadObjMdt=====');
		const columnsToHide = ['id', 'developername', 'language', 'namespaceprefix', 'qualifiedapiname', 'masterlabel'];
		let objFields = await this.getObjFields(this.fileUploadObjMdt);
		var mdtToIns = [];
		objFields.forEach(field =>{
			let obj = {}
			if(!columnsToHide.includes(field.fieldApiName)){
				if(!mdtToIns.includes(obj) && (field.fieldApiName === "drop_zone__object_label__c" || field.fieldApiName === "drop_zone__object_api_name__c")){
					obj[[field.fieldApiName]] = this.objValue;
				}else if(field.fieldApiName === "drop_zone__application__c"){
					obj[[field.fieldApiName]] = this.csvApplicationLabel.replaceAll(' ','_');
				}else if(field.fieldApiName === "Drop_Zone__Parent_Record_Id__c".toLowerCase() && this.parentLookUp){
					obj[[field.fieldApiName]] = this.parentLookUp;
				}
				mdtToIns.push(obj);
			}
		});
		return await this.createCustomMetadata(this.fileUploadObjMdt, this.csvApplicationLabel.replaceAll(' ','_'), this.csvApplicationLabel.replace(' ','_'), mdtToIns);
	}

	async createUploadFieldMdt(){
		console.log('in createUploadFieldMdt===');
		let flds = await this.getObjFields(this.fileUploadFieldMdt);

		let dt = this.tableData;
		
		dt.forEach(async element =>{
			let _id = null;
			var mapObjField = [];
			let obj = {};
            if(element.field){
				console.log('field ',element.field);
                flds.forEach(field =>{
					if( field.fieldApiName === 'drop_zone__csv_file_upload_object__c'){
						obj[[field.fieldApiName]] = this.csvApplicationLabel.replaceAll(' ','_');
					}else if(field.fieldApiName === 'Drop_Zone__CSV_Column_Name__c'.toLowerCase()){
						obj[[field.fieldApiName]] = element.column;
					}else if(field.fieldApiName === 'Drop_Zone__Field_API_Name__c'.toLowerCase()){
						obj[[field.fieldApiName]] = element.field;
					}else if(field.fieldApiName === 'Drop_Zone__Field_Label__c'.toLowerCase()){
						obj[[field.fieldApiName]] = element.inpVal;
					}else if(field.fieldApiName === 'Drop_Zone__Required__c'.toLowerCase()){
						obj[[field.fieldApiName]] = element.required != undefined ? element.required : false;
					}
			    });
				
				let devName = element.column.includes(' ') ? element.column.replaceAll(' ', '_') : element.column;
				mapObjField.push(obj);
				_id = await this.createCustomMetadata(this.fileUploadFieldMdt, devName, this.csvApplicationLabel.replaceAll(' ','_')+'_'+element.column, mapObjField);
				console.log('createUploadFieldMdt id ',_id);
				if(_id){
					var status = await this.checkDeployment(_id);
					console.log('upload field status_1 ', status);
					if(status !== 'succeeded'){
						for(let i=0;i<=50;i++){
							if(status === 'pending' || status === 'inprogress'){
								status = await this.checkDeployment(_id)
							}else if(status === 'succeeded'){
								break;
							}
						}
					}else if(status === 'failed'){
						this.displayToast('error', 'Error creating '+element.column +' CSV_File_Upload_Field__mdt');
					}
					if(status === 'pending' || status === 'inprogress'){
						this.displayToast('error', 'Requesting is taking longer than expected!');
					}
				}
            }
		});
		
	}

	async createCustomMetadata(mdtObjName, devName, mdtLabel, map){
		var res;
		await createCustomMdt({fullName : mdtObjName, mdtDevName : devName, label : mdtLabel, fieldWithValues : JSON.stringify(map)})
		.then(result =>{
			console.log('createCustomMdt result ', result);
			res = result;
		}).catch(error =>{
			console.log('createCustomMdt error ', error);
		});
		return res;
	}

	async checkDeployment(jobId){
		var resp;
		await checkDeploymentStatus({deployRequestId : jobId})
		.then(response =>{
			console.log('checkDeploymentStatus ',response);
			resp = response;
		}).catch(error =>{
			console.log('checkDeploymentStatus error ',error);
		})
		return String(resp).toLowerCase();
	}
}