﻿/**
Провайдер AnyBalance (http://any-balance-providers.googlecode.com)
*/

var g_headers = {
	'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
	'Accept-Charset': 'windows-1251,utf-8;q=0.7,*;q=0.3',
	'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
	'Connection': 'keep-alive',
	'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.76 Safari/537.36',
};

function main() {
	var prefs = AnyBalance.getPreferences();
	var baseurl = 'http://info.sp.bitrace.ru/';
	AnyBalance.setDefaultCharset('utf-8');
	
	checkEmpty(prefs.login, 'Введите логин!');
	checkEmpty(prefs.password, 'Введите пароль!');
	
	var html = AnyBalance.requestGet(baseurl + 'login.aspx?ReturnUrl=%2fexit.aspx', g_headers);
	
	var params = createFormParams(html, function(params, str, name, value) {
		if (name == 'TextBox1') 
			return prefs.login;
		else if (name == 'TextBox2')
			return prefs.password;

		return value;
	});
	
	html = AnyBalance.requestPost(baseurl + 'login.aspx?ReturnUrl=%2fexit.aspx', params, addHeaders({Referer: baseurl + 'login.aspx?ReturnUrl=%2fexit.aspx'}));
	
	if (!/exit.aspx/i.test(html)) {
		var error = getParam(html, null, null, /<div[^>]+class="t-error"[^>]*>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i, replaceTagsAndSpaces, html_entity_decode);
		if (error)
			throw new AnyBalance.Error(error, null, /Неверный логин или пароль/i.test(html));
		
		throw new AnyBalance.Error('Не удалось зайти в личный кабинет. Сайт изменен?');
	}
	
	var result = {success: true};
	
	getParam(html, result, 'balance', /Баланс счёта(?:[^>]*>){4}([^<]+)/i, replaceTagsAndSpaces, parseBalance);
	getParam(html, result, 'deadline', /Баланс счёта(?:[^>]*>){5}([^<]+)/i, replaceTagsAndSpaces, parseDate);
	
	AnyBalance.setResult(result);
}