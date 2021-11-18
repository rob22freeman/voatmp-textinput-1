	import { IInputs, IOutputs } from "./generated/ManifestTypes";

	//Import Nunjucks libraries
	import * as Nunjucks from "nunjucks";
	import { parse } from "path";
	import { Context } from "vm";

	export class TextInput implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	
		// Value of the column is stored and used inside the component
		private _value: string | null;

		// Reference to the control container HTMLDivElement
		// This element contains all elements of our custom control example
		private _container: HTMLDivElement;
	
	  	// reference to Power Apps component framework Context object
	  	private _context: ComponentFramework.Context<IInputs>;

		// PCF framework delegate which will be assigned to this object which would be called whenever any update happens
		private _notifyOutputChanged: () => void;
		
		// Internal structure used to store the values of the currently selected options
//		private _selectedOptions: number[];

		// Event Handler 'refreshData' reference
		private _refreshData: EventListenerOrEventListenerObject;
		

		// Configuration options for width of input box
		private _fixedAndFluidWidthInputsClass: string;
		private _characterWidth2: boolean;
		private _characterWidth3: boolean;
		private _characterWidth4: boolean;
		private _characterWidth5: boolean;
		private _characterWidth10: boolean;
		private _characterWidth20: boolean;
		private _fullWidth: boolean;
		private _threeQuartersWidth: boolean;
		private _twoThirdsWidth: boolean;
		private _oneHalfWidth: boolean;
		private _oneThirdWidth: boolean;
		private _oneQuarterWidth: boolean;

		// Configuration option for input type
		private _wholeNumber: boolean;
		private _inputmode: string;
		private _pattern: string;

		// Configuration options for spellcheck (on or off)
		private _spellcheck: boolean;
		private _disableSpellcheck: boolean;


		// Elements needed for setting up error messages 
		private _formGroupDiv: HTMLDivElement;

		private _fieldSet: HTMLFieldSetElement;

		private _hintDiv: HTMLDivElement;

		private _radiosDiv: HTMLDivElement;
		
		private _radioOptionList: HTMLCollectionOf<HTMLDivElement>;

		private _radioItem: HTMLOptionElement;
		
		private _enableValidation : boolean;		
		
		private _uniqueIdentifier: string;
		
		// Heading (what is being asked for), Field Identifier (for the error messaging), Hint
		private _heading: string;

		private _fieldIdentifier: string;

	  	private _hint: string;

		private _hintId: string;

		// Error message to be displayed
		private _errorMessage: string;

		private _itemId: string;
		
		private _containerLabel: string;

		/**
		 * Empty constructor.
		 */
		constructor() {
			// no-op: method not leveraged by this example custom control
		}
	
		/**
		 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
		 * Data-set values are not initialized here, use updateView.
		 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
		 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
		 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
		 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
		 */
		public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
			
			this.registerNunjucks();

			// Add control initialization code
			this._context = context;
			this._notifyOutputChanged = notifyOutputChanged;
//			this._refreshData = this.refreshData.bind(this);
	
			this._heading = context.parameters.heading.raw as string;
			this._hint = context.parameters.hint.raw as string;
			
			// Store the values currently selected
		//	this._selectedOptions = context.parameters.textInput.raw || [];

			// The unique identifier should be configured to the field logical name
			this._uniqueIdentifier = context.parameters.uniqueIdentifier.raw as string; // Required so should never be null

			// Concatenate the unique identifier with elements of the control to provide IDs
			this._hintId = this._uniqueIdentifier + "-hint";

			// The Portal automatically generates a container for the PCF which is the field logical name suffixed with "_Container"
			this._containerLabel = this._uniqueIdentifier + "_Container";

			// For whole number input mode, set the default values to "", unless the whole number option is selected in the configuration
			this._inputmode = "";
			this._pattern = "";
/*
			const optionArray: any = [];
			(context.parameters.itemValue as ComponentFramework.PropertyTypes.MultiSelectOptionSetProperty).attributes?.Options.forEach(option =>
				{
					let optionElement = document.createElement("option");
					optionElement.setAttribute("value", String(option.Value));
					optionElement.innerText = option.Label;
					optionArray.push(optionElement.innerText = option.Label);
				});

			const radios: any = [];
			function eachOption () {
				let optionLength = optionArray.length;
				for (let i = 0; i < optionLength; i++) {
					let options = {value: optionArray[i], text: optionArray[i]};
					radios.push(options);
				}
			};
			eachOption();
*/


			this.fixedAndFluidWidthInputs();
			this.inputType();
			this._spellcheck = this.disableSpellcheck();

			//Configure and render Nunjucks templates
			var runOnServer = "http://127.0.0.1:8080/";
			require('govuk-frontend');
			var templatePath = "node_modules/govuk-frontend/govuk/components/";
			var env = Nunjucks.configure(runOnServer + templatePath);
			var renderedNunjucksTemplate = env.render('/input/template.njk',{params:{
				label: {
					text: this._heading,
					classes: "govuk-label--l",
					isPageHeading: true
				  },
				  classes: this._fixedAndFluidWidthInputsClass,
				  hint: {
					text: this._hint
				  },
				  id: this._uniqueIdentifier,
				  name: this._uniqueIdentifier,
				  inputmode: "",
				  pattern: "",
				  spellcheck: this._spellcheck
				} });
			
			this._container = document.createElement("div");
			this._container.innerHTML =

			// Override that PCF Test Environment aligns to centre
				"<style>.control-pane{text-align:unset;}</style>\n"
				+ renderedNunjucksTemplate;

			// Add the entire container to the control's main container
			container.appendChild(this._container);
			
	//		this._formGroupDiv = document.getElementsByClassName("govuk-form-group")[0] as HTMLDivElement;
	//		this._fieldSet = document.getElementsByClassName("govuk-fieldset")[0] as HTMLFieldSetElement;
			this._hintDiv = document.getElementById(this._hintId) as HTMLDivElement;
	//		this._radiosDiv = document.getElementsByClassName("govuk-radios")[0] as HTMLDivElement;
/*
			this._radioOptionList = document.getElementsByClassName("govuk-radios__input") as HTMLCollectionOf<HTMLDivElement>;
			let radioLength = this._radioOptionList.length;
			for (let i = 0; i < radioLength; i++) {
				this._radioItem = document.getElementsByClassName("govuk-radios__input")[i] as HTMLOptionElement
				this._radioItem.addEventListener("change", this._refreshData);
			};
*/
			this._enableValidation = false;

			this.removeHintDiv();
			this.registerPCFComponent(this);
			this.pageValidation();
		}

		/**
		 * Remove hint div from control if no hint text is required.
		 */
		public removeHintDiv() {
			if (this._hint === undefined) {
				this._hintDiv.remove();
			}
		}

		/**
		 * Configure the size of the text input box based on the selected option for "Fixed and fluid width inputs".
		 * If no option is selected, the default configuration is "full width", as dictated by the GOVUK Design System:
		 * "By default, the width of text inputs is fluid and will fit the full width of the container they are placed into." 
		 * https://design-system.service.gov.uk/components/text-input/
		 */
		private fixedAndFluidWidthInputs () {

			// selected options for Control Manifest: "Fixed and fluid width inputs"
			this._characterWidth2 = this._context.parameters.fixedAndFluidWidthInputs.raw == "1";
			this._characterWidth3 = this._context.parameters.fixedAndFluidWidthInputs.raw == "2";
			this._characterWidth4 = this._context.parameters.fixedAndFluidWidthInputs.raw == "3";
			this._characterWidth5 = this._context.parameters.fixedAndFluidWidthInputs.raw == "4";
			this._characterWidth10 = this._context.parameters.fixedAndFluidWidthInputs.raw == "5";
			this._characterWidth20 = this._context.parameters.fixedAndFluidWidthInputs.raw == "6";
			this._fullWidth = this._context.parameters.fixedAndFluidWidthInputs.raw == "7";
			this._threeQuartersWidth = this._context.parameters.fixedAndFluidWidthInputs.raw == "8";
			this._twoThirdsWidth = this._context.parameters.fixedAndFluidWidthInputs.raw == "9";
			this._oneHalfWidth = this._context.parameters.fixedAndFluidWidthInputs.raw == "10";
			this._oneThirdWidth = this._context.parameters.fixedAndFluidWidthInputs.raw == "11";
			this._oneQuarterWidth = this._context.parameters.fixedAndFluidWidthInputs.raw == "12";

			// 2 character width
			if (this._characterWidth2) {
				this._fixedAndFluidWidthInputsClass = "govuk-input--width-2";
			} 

			// 3 character width
			else if (this._characterWidth3) {
				this._fixedAndFluidWidthInputsClass = "govuk-input--width-3";
			}

			// 4 character width
			else if (this._characterWidth4) {
				this._fixedAndFluidWidthInputsClass = "govuk-input--width-4";
			}

			// 5 character width
			else if (this._characterWidth5) {
				this._fixedAndFluidWidthInputsClass = "govuk-input--width-5";
			}

			// 10 character width
			else if (this._characterWidth10) {
				this._fixedAndFluidWidthInputsClass = "govuk-input--width-10";
			}

			// 20 character width
			else if (this._characterWidth20) {
				this._fixedAndFluidWidthInputsClass = "govuk-input--width-20";
			}

			// full width
			else if (this._fullWidth) {
				this._fixedAndFluidWidthInputsClass = "govuk-!-width-full";
			}

			// three quarters width
			else if (this._threeQuartersWidth) {
				this._fixedAndFluidWidthInputsClass = "govuk-!-width-three-quarters";
			}

			// two thirds width
			else if (this._twoThirdsWidth) {
				this._fixedAndFluidWidthInputsClass = "govuk-!-width-two-thirds";
			}

			// one half width
			else if (this._oneHalfWidth) {
				this._fixedAndFluidWidthInputsClass = "govuk-!-width-one-half";
			}

			// one third width
			else if (this._oneThirdWidth) {
				this._fixedAndFluidWidthInputsClass = "govuk-!-width-one-third";
			}

			// one quarter width
			else if (this._oneQuarterWidth) {
				this._fixedAndFluidWidthInputsClass = "govuk-!-width-one-quarter";
			}
			
			// default full width: "By default, the width of text inputs is fluid and will fit the full width 
			// of the container they are placed into." https://design-system.service.gov.uk/components/text-input/
			else {
				this._fixedAndFluidWidthInputsClass = "govuk-!-width-full";
			}
		};

		/**
		 * If you’re asking the user to enter a whole number and you want to bring up the numeric keypad on a mobile device, 
		 * set the inputmode attribute to numeric and the pattern attribute to [0-9]*.
		 * If you’re asking the user to enter a number that might include decimal places, use input type="text" without inputmode or pattern attributes.
		 * Do not set the inputmode attribute to decimal as it causes some devices to bring up a keypad without a key for the decimal separator.
		 * https://design-system.service.gov.uk/components/text-input/
		 * 
		 */
		private inputType () {

			// selected option for Control Manifest: "Input Type"
			this._wholeNumber = this._context.parameters.inputType.raw == "1";

			if (this._wholeNumber) {
				this._inputmode = "numeric", 
				this._pattern = "[0-9]*"
			}
		};

		/**
		 * Following guidance from the GOVUK Design System, there are occasions where spellcheck should be disabled:
		 * "If you are asking users for information which is not appropriate to spellcheck, like a reference number, name, email address 
		 * or National Insurance number, disable the spellcheck."
		 * https://design-system.service.gov.uk/components/text-input/
		 * By default, the component will have spellcheck enabled.
		 */
		private disableSpellcheck () {

			this._disableSpellcheck = this._context.parameters.disableSpellcheck.raw == "1";

			if (this._disableSpellcheck) {
				return false;
			} else {
				return true;
			}
		};

		private toggleAutocomplete () {

		};



/*		public enableValidation() {

			let validationEnabled = this._enableValidation = true;
			let doValidation = this._selectedOptions.length === 0 && validationEnabled;

			if (doValidation) {
				this.performInputValidation();
			};
		}
*/
		/**
		 * Show error on control.
		 * @param errorMessageText Error message to display
		 */
		public ShowError(errorMessageText : string) {
			
			// Hide error message if one already exists
			this.HideError();

			this._formGroupDiv.classList.add("govuk-form-group--error");

			let errorMessageId = "errorMessage";

			// Create and add error message span
			let errorMessageSpan = document.createElement("span");
			errorMessageSpan.classList.add("govuk-error-message");
			errorMessageSpan.id = errorMessageId;
			errorMessageSpan.innerHTML = "<span class=\"govuk-visually-hidden\">Error:</span> " + errorMessageText;

			this._radiosDiv.before(errorMessageSpan);

			// Add error message to field set's aria-describedby attribute,
			// if it doesn't already exist
			let ariaDescribedBy = this._fieldSet.getAttribute("aria-describedby");
			let ariaDescribedByList = ariaDescribedBy?.split(" ");
			let hasAriaDescribedByListGotId = ariaDescribedByList?.includes(errorMessageId);
			
			if (!hasAriaDescribedByListGotId) {
				ariaDescribedByList?.push(errorMessageId);
			}

			this._fieldSet.setAttribute("aria-describedby", ariaDescribedByList?.join(" ") ?? "");

			// Store error message for use in page level validation
			this._errorMessage = errorMessageText;
		}

		/**
		 * Hide error on control.
		 */
		private HideError() {
			
			let errorMessageId = "errorMessage";

			// Remove form group div error styling if it's present
			this._formGroupDiv.classList.remove("govuk-form-group--error");

			// Delete error message div if it exists
			let errorMessageDiv = document.getElementById(errorMessageId);
			errorMessageDiv?.remove();

			// Remove error message from field set's aria-describedby attribute, if it exists
			let ariaDescribedBy = this._fieldSet.getAttribute("aria-describedby");
			let ariaDescribedByList = ariaDescribedBy?.split(" ");
			let AriaDescribedByListErrorIdIndex = ariaDescribedByList?.indexOf(errorMessageId) ?? -1;
			
			if (AriaDescribedByListErrorIdIndex !== -1) {
				ariaDescribedByList?.splice(AriaDescribedByListErrorIdIndex, 1);
			}

			this._fieldSet.setAttribute("aria-describedby", ariaDescribedByList?.join(" ") ?? "");
		}

		/**
		 * Converts first letter of error message for showError output to lowercase (acting as a fail safe so the correct format is always displayed)
		 * @param string {string} Error message to have first letter converted to lowercase.
		 * @returns {string} Error message with first letter converted to lowercase.
		 */
		 private firstCharLowerCase(string: string): string {
			
			return string.charAt(0).toLowerCase() + string.slice(1);
		}

		/**
		 * Updates the values to the internal value variable we are storing and also updates the html label that displays the value
		 * @param context : The "Input Properties" containing the parameters, component metadata and interface functions
		 */
/*		public refreshData(evt: Event): void {
			
			const value = Number(this._radioItem.getAttribute("value"))
			this._selectedOptions.push(value);
			this._enableValidation = false;
			this.HideError();
			this._notifyOutputChanged();			
		}
*/
		/**
		 * Validates contents of input fields and updates UI with appropriate error messages.
		 * @returns {boolean} True if validation passed. Otherwise, false.
		 * @private
		 */
		private performInputValidation() : boolean {
			
			let fieldIdentifier = this._fieldIdentifier = this._context.parameters.fieldIdentifierErrorMessage.raw as string;
			let isInputValid : boolean = true;

			// Reset error state
			this.HideError();

			//if (this._enableValidation === true) {
			//	isInputValid &&= this.handleIfNothingIsSelected(fieldIdentifier);
			//};

			return isInputValid;
		}

		private pageValidation() {

			let _window = window as any;
			if (typeof (_window.Page_Validators) == "undefined") {
				return;
			}
		
			let newValidator = (document.createElement('span') as any); //any = custom properties for val
			newValidator.style.display = "none";
			newValidator.id = this._uniqueIdentifier + "Validator";
			newValidator.controltovalidate = this._uniqueIdentifier;
			newValidator.evaluationfunction = function () {
		
				let result = _window.HSL.PCFRegistrar[this.controltovalidate].performInputValidation();
				this.isvalid = result;
		
				if (!this.isvalid) {
					let errorMessageText = _window.HSL.PCFRegistrar[this.controltovalidate]._errorMessage;
					this.errormessage = "<a href='#" + _window.HSL.PCFRegistrar[this.controltovalidate]._containerLabel + "' onclick=\"javascript: let component = '" + _window.HSL.PCFRegistrar[this.controltovalidate]._containerLabel + "'; component.scrollIntoView; return false;\">" + errorMessageText + "</a>";
				} else {
					this.errormessage = null;
				}
			}
		
			_window.Page_Validators.push(newValidator);
		}
			
		/**
		 * @param fieldIdentifier {string} Identify name of field to display in error messages
		 * @returns {boolean} Returns true if nothing is selected. Otherwise false;
		 * @private
		 */
/*		private handleIfNothingIsSelected (fieldIdentifier: string) : boolean {
			
			let isOptionSelected = this._selectedOptions.length === 0;

			if (isOptionSelected) {
				this._enableValidation = true;
				this.ShowError('Select ' + this.firstCharLowerCase(fieldIdentifier));
			};

			return !isOptionSelected;
		}
*/
		/**
		 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
		 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
		 */
		public updateView(context: ComponentFramework.Context<IInputs>): void {	
			
		// storing the latest context from the control.
		this._value = context.parameters.textInput.raw;
	  	this._context = context;
		/*	
			if () {
			this._enableValidation = true;
			};*/
		}
	
		/** 
		 * It is called by the framework prior to a control receiving new data. 
		 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
		 */
		public getOutputs(): IOutputs {

			// Send the currently selected options back to the ComponentFramework
			return {
				textInput: (this._value === null ? undefined : this._value)
			};
		}
	
		/** 
		 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
		 * i.e. cancelling any pending remote calls, removing listeners, etc.
		 */
		public destroy(): void {

			// no-op: method not leveraged by this example custom control
		}

		private registerPCFComponent(currentInstance:TextInput) : void {
			
			let globalScope = (window as any);
			
			if (!globalScope.HSL) {
				globalScope.HSL = {};
			}
			
			if (!globalScope.HSL.PCFRegistrar) {
				globalScope.HSL.PCFRegistrar = {};
			}

			globalScope.HSL.PCFRegistrar[this._uniqueIdentifier] = currentInstance;
		};

		private registerNunjucks() : void
		{
			let globalScope = (window as any);
			globalScope.nunjucks = Nunjucks;
			
			//reconfigure template render to understand relative paths
			globalScope.nunjucks.Environment.prototype.resolveTemplate = function resolveTemplate(loader:any, parentName:any, filename:any) {
				let isRelative = loader.isRelative && parentName ? loader.isRelative(filename) : false;
				return isRelative && loader.resolve ? filename.replace('..', '').replace('./', parentName.substring(0, parentName.lastIndexOf("/")) + '/') : filename;
			};
		}
	}
