/*
*This is auto generated from the ControlManifest.Input.xml file
*/

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
    itemValue: ComponentFramework.PropertyTypes.MultiSelectOptionSetProperty;
    heading: ComponentFramework.PropertyTypes.StringProperty;
    fieldIdentifierErrorMessage: ComponentFramework.PropertyTypes.StringProperty;
    hint: ComponentFramework.PropertyTypes.StringProperty;
    uniqueIdentifier: ComponentFramework.PropertyTypes.StringProperty;
}
export interface IOutputs {
    itemValue?: number[];
}
