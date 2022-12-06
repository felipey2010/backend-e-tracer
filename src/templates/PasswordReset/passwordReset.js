require("dotenv").config()

function getPasswordResetTemplate(code) {
  const site_uri = process.env.SITE_URI
  const htmlCode =
    '<!DOCTYPE html><html lang="pt-BR"><head>' +
    '<meta content="text/html; charset=utf-8" http-equiv="Content-Type" />' +
    "<title>Recuperação de senha</title>" +
    '<meta name="description" content="Solicitação de recuperação de senha" />' +
    '<style type="text/css">a:hover {text-decoration: underline !important;}' +
    "</style></head>" +
    '<body marginheight="0" topmargin="0" marginwidth="0"' +
    'style="margin: 0px; background-color: #f2f3f8; margin-bottom: 8px; padding-bottom: 8px;" leftmargin="0">' +
    '<table cellspacing="0" border="0" cellpadding="0" width="100%"' +
    'bgcolor="#f2f3f8" style="font-family: sans-serif">' +
    "<tr><td><table" +
    'style="background-color: #f2f3f8; max-width: 670px; margin: 0 auto"' +
    'width="100%" border="0" align="center" cellpadding="0" cellspacing="0">' +
    "<tr><td><table" +
    'width="95%" border="0" align="center" cellpadding="0" cellspacing="0"' +
    'style="margin-top: 12px; max-width: 670px;' +
    "background: #fff; border-radius: 8px; text-align: center;" +
    "-webkit-box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06);" +
    "-moz-box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06);" +
    'box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06);">' +
    '<tr><td style="padding: 12px 35px">' +
    '<h1 style="color: #1e1e2d; font-weight: 500;' +
    'margin: 0; font-size: 32px; font-family: auto, sans-serif;">' +
    "Você solicitou a recuperação da sua senha</h1>" +
    '<span style="display: inline-block; vertical-align: middle;' +
    "margin: 6px 0 6px; border-bottom: 1px solid #cecece;" +
    'width: 100px;"></span>' +
    '<h2 style="' +
    "font-family: cursive, monospace; font-size: clamp(1rem, 2rem, 2rem);" +
    'margin: 0;">' +
    code +
    "</h2>" +
    '<span style="' +
    "display: inline-block; vertical-align: middle; margin: 6px 0 6px;" +
    'border-bottom: 1px solid #cecece; width: 100px;"></span>' +
    '<p style="color: #455056; font-size: 14px;' +
    'line-height: 20px; margin: 0;">' +
    "Para completar a recuperação da sua senha, informe o código acima no site.</p>" +
    '<p style="color: #455056; font-size: 14px; line-height: 20px;' +
    'margin: 0;">' +
    "Não compartilhe esse código com ninguém por questão de segurança.</p>" +
    '<p style="color: #455056; font-size: 14px;' +
    'line-height: 20px; margin: 0;">' +
    "Este código é válido por apenas 12 horas. Depois que o" +
    " código expirar, você precisará fazer uma nova solicitação.</p>" +
    '<a href="' +
    site_uri +
    '"' +
    'style="background: #20e277;' +
    "text-decoration: none !important; font-weight: 500;" +
    "margin-top: 20px; color: #fff;" +
    "text-transform: uppercase; font-size: 14px;" +
    "padding: 8px 20px; display: inline-block;" +
    "border-radius: 50px;" +
    '" >Ir para o site</a></td></tr>' +
    '<tr><td style="text-align: center; padding-top: 8px">' +
    '<p style="font-size: 14px;' +
    "color: rgba(69, 80, 86, 0.7411764705882353);" +
    'line-height: 18px; margin: 0 0 8px;">' +
    "&copy; <strong>Equipe - SmartDash</strong></p></td></tr>" +
    "</table></td></tr></table>" +
    "</td></tr></table></body></html>"

  return htmlCode
}

module.exports = { getPasswordResetTemplate }
