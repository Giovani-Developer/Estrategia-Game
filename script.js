const apiKeyInput = document.getElementById('apiKey')
const gameSelect = document.getElementById('gameId')
const questionInput = document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const aiResponse = document.getElementById('aiResponse')
const form = document.getElementById('form')

const markdownToHTML = (text) => {
  const converter = new showdown.Converter()
  return converter.makeHtml(text)
}

const perguntarAI = async (question, game, apiKey) => {
  const model = "gemini-2.0-flash"
  const baseURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const pergunta = `
  ## Especialidade
  Você é um especialista assistente de meta para o jogo ${game}
  
  ##Tarefa
  Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, build e dicas

  #Regras
  -Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta
  - Se a pergunta não está relacionada com o jogo, responda com 'Essa pergunta não está relacionada com o jogo'
  -Considere a data atual ${new Date().toLocaleDateString()}
  -Faça pesquisas atualizadas sobre o patch atual baseado na data atual para dar uma resposta coerente
  -Nunca responda itens que você não tenha certeza que tenha no patch atual.

  ##Resposta
  Economize na resposta, seja direto e responda no máximo 800 carácteres dando dicas de jogabilidade. Responda no markdown
  - Não precisa fazer nenhuma saudação ou despedida, apenas o que o usuário esta perguntando

  ---

  Aqui está a pergunta do usuário: ${question}
  `

  const content = [{
    role: "user",
    parts: [{ text: pergunta }]
  }]

  const tools = [{
    google_search:{}
  }]

  const response = await fetch(baseURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: content,
      tools      
    })
  })

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

const sendForm = async (event) => {
  event.preventDefault()
  const apiKey = apiKeyInput.value
  const game = gameSelect.value
  const question = questionInput.value

  if (apiKey === '' || game === '' || question === '') {
    alert('Por favor, preencha todos os campos!')
    return
  }

  askButton.disabled = true
  askButton.textContent = 'Perguntando...'
  askButton.classList.add('loading')

  try {
    const text = await perguntarAI(question, game, apiKey)
    aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text)
    aiResponse.classList.remove('hidden')
  } catch (error) {
    console.log('Erro: ', error)
    aiResponse.textContent = 'Erro ao tentar se comunicar com a API.'
  } finally {
    askButton.disabled = false
    askButton.textContent = "Perguntar"
    askButton.classList.remove('loading')
  }
}

form.addEventListener('submit', sendForm)
