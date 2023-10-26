export let schema: any = {
	name: 'user',
	label: 'User',
	fields: {
		name: {
			name: 'name',
			label: 'Name',
			type: 'string',
			required: false
		},
		firstName: {
			name: 'firstName',
			label: 'First Name',
			type: 'string',
			required: true
		},
		lastName: {
			name: 'lastName',
			label: 'Last Name',
			type: 'string',
			required: true
		},
		email: {
			name: 'email',
			label: 'email',
			type: 'string',
			required: false,
			unique: true
		},
		contactId: {
			name: 'contactId',
			label: 'Contact Id',
			type: 'string',
			required: true
		},
		phone: {
			name: 'phone',
			label: 'Phone',
			type: 'string',
			required: false,
			unique: true
		},
		password: {
			name: 'password',
			label: 'Password',
			type: 'string',
			required: true
		},
		salt: {
			name: 'salt',
			label: 'Salt',
			type: 'string',
			required: true
		},
		isMFAEnabled: {
			name: 'isMFAEnabled',
			label: 'Is Multi Factor Enabled?',
			type: 'bool',
			required: false,
			default: false
		},
		createdOn: {
			name: 'createdOn',
			label: 'Created On',
			type: 'date',
			required: true
		},
		modifiedOn: {
			name: 'modifiedOn',
			label: 'Modified On',
			type: 'date',
			required: true
		}
	}
};
