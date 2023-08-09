function gerarToken(tamanho) {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    
    for (let i = 0; i < tamanho; i++) {
      const randomIndex = Math.floor(Math.random() * caracteres.length);
      token += caracteres.charAt(randomIndex);
    }
    
    return token;
}

module.exports = gerarToken;