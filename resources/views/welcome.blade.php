<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Clima Certo - Alertas Diários</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 h-screen flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 class="text-2xl font-bold mb-6 text-center text-blue-600">Alerta de Clima</h1>
        
        <form action="/cadastrar" method="POST">
            @csrf <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Seu E-mail</label>
                <input type="email" name="email" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border">
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700">Sua Cidade</label>
                <input type="text" name="city" required class="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border">
            </div>

            <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition">
                Quero receber alertas
            </button>
        </form>
    </div>
</body>
</html>