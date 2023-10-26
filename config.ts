const config: any = {
	userFields: ['_id', 'name', 'firstName', 'lastName', 'gender', 'email', 'Phone', 'isMFAEnabled', 'userName', 'createdOn'],
	fieldsNotToReturn: ['password', 'salt', 'isTestRecord', 'createdOn', 'modifiedOn'],
	userFieldsNotToUpdate: ['email', 'userName', 'createdOn', 'modifiedOn', 'isTestRecord', 'password', 'salt'],
	salesForceContactFields: ['Id', 'FirstName', 'LastName', 'Email', 'Phone', 'Salutation', 'Preferred_Method_of_Communication__c', 'MobilePhone', 'Are_you_a_recycling_company__c', 'How_can_we_help__c', 'Communication_Opt_In__c', 'Terms_And_Conditions__c', 'Vendor_Agreement__c', 'Username__c', 'Company_Name__c'],
	salesforceAccountFields: ['Id', 'Name', 'Full_Legal_Name_Of_Business__c', 'Doing_Business_As__c', 'Do_you_have_loading_dock__c', 'Phone', 'Primary_Contact__c', 'Federal_EIN__c', 'State_of_Incorporation__c', 'State_Tax_ID__c', 'Verification_Status__c', 'Vendor_Number__c', 'Verification_Comment__c', 'Sales_Tax_Exempt__c', 'Verified__c','Account_Holder_Name__c', 'Account_Number__c', 'Routing_Number__c', 'Payment_Method__c', 'Organization_Type__c', 'Bank_Name__c'],
	salesforceAccountFieldsToQuery: ['Id', 'Name', 'Full_Legal_Name_Of_Business__c', 'Doing_Business_As__c', 'Do_you_have_loading_dock__c', 'Phone', 'Primary_Contact__c', 'Federal_EIN__c', 'State_of_Incorporation__c', 'State_Tax_ID__c', 'Verification_Status__c', 'Vendor_Number__c', 'Verification_Comment__c', 'Sales_Tax_Exempt__c', 'Verified__c','Account_Holder_Name__c', 'Account_Number__c', 'Routing_Number__c', 'Payment_Method__c', 'Organization_Type__c', 'Bank_Name__c', 'Description', 'Client_submitted_form__c', 'Organization_Type_Details__c', 'BillingStreet', 'BillingCity', 'BillingState', 'BillingPostalCode', 'BillingCountry' ],
	salesforceOpportunityFields: ['Id', 'AccountId', 'CreatedDate', 'Name', 'Type', 'Subtype__c', 'Subtype_Details__c', 'StageName', 'Weight__c', 'Pricebook2Id', 'Amount', 'TradeNotes__c'],
	salesforceOpportunityLineItemFields: ['Id', 'Name', 'Quantity', 'UnitPrice', 'TotalPrice', 'PricebookEntryId', 'Product2Id' , 'OpportunityId'],
	salesforceShipmentFields: ['Id', 'Name', 'Shipping_By__c', 'Carrier_Name__c', 'Tracking_Number__c', 'Shipping_Date__c', 'Total_Quantity__c', 'Opportunity_Name__c', 'Scheduled_Pickup_Time__c'],
	settingRecord: {
		defaultSessionExpiration: 30,
		defaultUserTokenExpiration: 43885,
		defaultPasswordExpiration: 90,
		verificationCodeExpiresIn: 20,
		minPasswordLength: 8,
		passwordPattern: '(?=^.{8,}$)((?=.*\\d)|(?=.*\\W+))(?![.\\n])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#\\$%\\^&\\*]).*$'
	},
	operators: {
		gt : '>',
		lt : '<',
		gte : '>=',
		lte : '<=',
		eq : '=',
		in : 'IN',
	}
};
export default config;

