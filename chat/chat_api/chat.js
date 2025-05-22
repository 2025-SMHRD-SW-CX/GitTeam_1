const supabaseUrl = "https://fszwgldiafcffgbbtlwo.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzendnbGRpYWZjZmZnYmJ0bHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODE1NjAsImV4cCI6MjA2MzI1NzU2MH0.ZznTYaj-KNjyzZHFwm03X7J3S9XLZrHkCi10XAcQ1JI"
// import.meta.env.VITE_SUPABASE_KEY;

// const API_KEY = import.meta.env.VITE_SUPABASE_KEY;

const db = supabase.createClient(supabaseUrl, supabaseKey);


const apiKey = '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'
// import.meta.env.env.VITE_API_KEY;

const chatArea = document.querySelector('.chat-area');
const userInput = document.querySelector('.input-box'); 

// DB 연결 함수 
// **유저 아이디 연결하기 
const saveChat=async (user_m,bot_m) => {
const user_id = localStorage.getItem("user_id")
const { data, error } = await db
  .from('ai_chat')
  .insert([
    {user_id : user_id, 
      sender : true,
      user_message: user_m,
    bot_message: bot_m},
  ])
  if (error) {
    console.error('저장 오류:', error.message);
  } else {
    console.log('저장 성공:', data);
  }
};




// 메시지를 채팅창에 추가하는 함수
function addMessage(sender, message) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('chat-message');

  if (sender === 'user') {
    messageElement.classList.add('user-m');
  } else {
    messageElement.classList.add('bot-m');
  }

  messageElement.textContent = message;
  chatArea.appendChild(messageElement);
  chatArea.scrollTop = chatArea.scrollHeight;
}

// AI 응답 요청
async function fetchAIResponse(prompt) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-3.5-turbo',
      messages: [{role: 'system',
        content: '너의 이름은 삼. 말투는 친구처럼 친근하게 말해되 예의는 지켜.다른 사람을 삼이라고 부르지 마.도와줄 일은 그 친구가 고민이 있다고 말할 때만 물어보고 너는 친근하게 계속 대화를 해.'
        },
        { role: 'user', content: prompt }



      ],
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
// 키보드 Enter 입력

userInput.addEventListener('keydown', async (event) => {
  if (event.key === 'Enter') {
    const message = userInput.value.trim();
    if (!message) return;


    


    addMessage('user', message);
    userInput.value = '';

    const reply = await fetchAIResponse(message);
    addMessage('bot', reply);


    saveChat(message,reply)
  }
});



