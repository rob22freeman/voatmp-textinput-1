/*
*This is auto generated from the ControlManifest.Input.xml file
*/

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
    textInput: ComponentFramework.PropertyTypes.StringProperty;
    heading: ComponentFramework.PropertyTypes.StringProperty;
    fieldIdentifierErrorMessage: ComponentFramework.PropertyTypes.StringProperty;
    hint: ComponentFramework.PropertyTypes.StringProperty;
    uniqueIdentifier: ComponentFramework.PropertyTypes.StringProperty;
    inputType: ComponentFramework.PropertyTypes.EnumProperty<"1" | "2">;
    fixedAndFluidWidthInputs: ComponentFramework.PropertyTypes.EnumProperty<"1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12">;
    prefixesAndSuffixes: ComponentFramework.PropertyTypes.EnumProperty<"1" | "2" | "3">;
    prefix: ComponentFramework.PropertyTypes.StringProperty;
    suffix: ComponentFramework.PropertyTypes.StringProperty;
    toggleAutocomplete: ComponentFramework.PropertyTypes.EnumProperty<"1" | "2">;
    toggleSpellcheck: ComponentFramework.PropertyTypes.EnumProperty<"1" | "2">;
}
export interface IOutputs {
    textInput?: string;
}
