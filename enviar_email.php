<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php'; // Garante que o PHPMailer seja carregado via Composer

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Coleta os dados do formulário
    $nome = $_POST['firstname'] ?? '';
    $sobrenome = $_POST['lastname'] ?? '';
    $email = $_POST['email'] ?? '';
    $telefone = $_POST['phone'] ?? '';
    $tipoMensagem = $_POST['inquiry'] ?? 'Não especificado';
    $mensagem = $_POST['message'] ?? '';

    $nomeCompleto = "$nome $sobrenome";

    // Monta o corpo do e-mail
    $corpo = "
        <strong>Nome:</strong> $nomeCompleto<br>
        <strong>E-mail:</strong> $email<br>
        <strong>Telefone:</strong> $telefone<br>
        <strong>Tipo de Mensagem:</strong> $tipoMensagem<br><br>
        <strong>Mensagem:</strong><br>" . nl2br($mensagem);

    // Envia o e-mail
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'pedrolhf06@gmail.com'; // SEU EMAIL
        $mail->Password   = 'hbzc bmix julz ausn'; // SUA SENHA DE APLICATIVO
        $mail->SMTPSecure = 'tls';
        $mail->Port       = 587;

        $mail->setFrom('pedrolhf06@gmail.com', 'Site Imobiliária');
        $mail->addAddress('pedrolhf06@gmail.com', 'Admin Imobiliária'); // email que vai receber

        $mail->isHTML(true);
        $mail->Subject = 'Nova mensagem de contato via site';
        $mail->Body    = $corpo;

        $mail->send();
        echo json_encode(['sucesso' => true, 'mensagem' => 'Mensagem enviada com sucesso.']);
    } catch (Exception $e) {
        echo json_encode(['sucesso' => false, 'erro' => $mail->ErrorInfo]);
    }
} else {
    echo json_encode(['erro' => 'Requisição inválida']);
}
