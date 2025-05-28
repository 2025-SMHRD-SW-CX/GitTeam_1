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
// 추가: 학교 밖 청소년 여부 확인 함수
const isSchoolOutYouth = async (user_id) => {
  const { data, error } = await db
    .from('pre_question')
    .select('category')
    .eq('user_id', user_id)
    .single();

  if (error) {
    console.error("학교 밖 청소년 여부 확인 실패:", error.message);
    return false;
  }

  return data.category === '학교밖 청소년';
};

//  saveChat 함수
const saveChat = async (user_m, bot_m) => {
  const user_id = localStorage.getItem("user_id");
  if (!user_id) {
    console.warn("user_id 없음");
    return;
  }

  const isOut = await isSchoolOutYouth(user_id);
  if (!isOut) {
    console.log("학교 밖 청소년이 아니므로 채팅을 저장하지 않음");
    return;
  }

  const { data, error } = await db
    .from('ai_chat')
    .insert([
      {
        user_id: user_id,
        sender: true,
        user_message: user_m,
        bot_message: bot_m
      }
    ]);

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
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '너의 이름은 삼. 말투는 친구처럼 친근하게 말해되 예의는 지켜.다른 사람을 삼이라고 부르지 마.도와줄 일은 그 친구가 고민이 있다고 말할 때만 물어보고 너는 친근하게 계속 대화를 해.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    // 응답이 실패하면 메시지 반환하고 종료
    if (!response.ok) {
      console.error("API 요청 실패:", response.status, response.statusText);
      return "죄송해요, 지금은 응답할 수 없어요 😢";
    }

    const data = await response.json();

    // 안전하게 접근
    if (!data.choices || data.choices.length === 0) {
      console.error("AI 응답 비어 있음:", data);
      return "죄송해요, AI가 지금 응답을 줄 수 없어요.";
    }

    return data.choices[0].message.content;

  } catch (error) {
    console.error("fetchAIResponse 처리 중 오류 발생:", error);
    return "죄송해요, 오류가 발생했어요.";
  }
}

// const data = await response.json();
// return data.choices[0].message.content;
// }
// 키보드 Enter 입력

userInput.addEventListener('keydown', async (event) => {
  if (event.key === 'Enter') {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage('user', message);
    userInput.value = '';

    const reply = await fetchAIResponse(message);
    addMessage('bot', reply);


    saveChat(message, reply)
  }
});

// 이미 있는 handleSend 함수 재사용
async function handleSend() {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage('user', message);
  userInput.value = '';

  const reply = await fetchAIResponse(message);
  addMessage('bot', reply);

  saveChat(message, reply);
}

// 이벤트 등록
document.querySelector('.mic-icon')?.addEventListener('click', handleSend);
document.querySelector('.mic-circle')?.addEventListener('click', handleSend);
userInput.addEventListener('keydown', async (event) => {
  if (event.key === 'Enter') {
    await handleSend();
  }
});




