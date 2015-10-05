// Simply 'inherites' helpers from AccountsTemplates
Template.atPwdFormBtn.helpers(AccountsTemplates.atPwdFormBtnHelpers);


Template.atPwdFormBtn.events = {
	'click #at-btn-polymer': function(event,template) {
		event.preventDefault();
		template.find('button[type=submit]').click();
	}
};
