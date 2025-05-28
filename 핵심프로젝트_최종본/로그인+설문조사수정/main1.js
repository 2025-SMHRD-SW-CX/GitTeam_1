// 기존 코드 + 테스트 함수 추가

const supabaseUrl = "https://fszwgldiafcffgbbtlwo.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzendnbGRpYWZjZmZnYmJ0bHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODE1NjAsImV4cCI6MjA2MzI1NzU2MH0.ZznTYaj-KNjyzZHFwm03X7J3S9XLZrHkCi10XAcQ1JI";
const db = supabase.createClient(supabaseUrl, supabaseKey);

// 테스트

document.addEventListener("DOMContentLoaded", function () {
  // Swiper 슬라이더 초기화 - 단 한 번만
  const swiper = new Swiper(".mySwiper", {
    slidesPerView: "auto",
    spaceBetween: 30,
    grabCursor: true,
    freeMode: true,
  });

  // 드래그로 슬라이드 이동
  const slider = document.querySelector(".slide-container");
  if (!slider) return;

  let isDown = false;
  let startX;
  let scrollLeft;
  let isDragging = false;

  slider.addEventListener("mousedown", (e) => {
    isDown = true;
    slider.classList.add("active");
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
    isDragging = false;
  });

  slider.addEventListener("mouseleave", () => {
    isDown = false;
    slider.classList.remove("active");
  });

  slider.addEventListener("mouseup", () => {
    isDown = false;
    slider.classList.remove("active");
    if (!isDragging) {
      const link = event.target.closest("a");
      if (link) {
        window.location.href = link.href;
      }
    }
  });

  slider.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1; // 스크롤 속도 조절
    if (Math.abs(walk) > 5) isDragging = true; // 5px 이상 움직이면 드래그로 판단
    slider.scrollLeft = scrollLeft - walk;
  });
});

// 🔥 미션 확인 및 업데이트 함수
const checkAndUpdateMission = async () => {
  try {
    
    // 현재 사용자 ID 가져오기
    const user_id = localStorage.getItem("user_id");  
    const today = new Date().toISOString().split('T')[0];

    // user_id가 같고 log_date가 오늘인 데이터 확인
    let { data: emotions, error:emotionsError} = await db
      .from('emotions')
      .select("*")
      .eq('user_id', user_id)
      .eq('log_date', today);
    
    if (emotionsError) {
      console.error('❌ 감정기록 조회 오류:', emotionsError.message);
    } else if (emotions && emotions.length > 0) {
      markMissionComplete("emotion");  // 감정 미션 완료
    } else {
      console.log("오늘 감정 기록 없음");
    }
        let { data: m_chat, error: chatError } = await db
    .from('m_chat')
    .select('*')
    .eq('user_id', user_id)
    // .gte('time', today + 'T00:00:00')
    // .lt('time', today + 'T23:59:59');

        if (chatError) {
        console.error('❌ 챗 기록 조회 오류:', chatError.message);
      } else if (m_chat && m_chat.length > 0) {
        markMissionComplete("chat");  // 챗 미션 완료
      } else {
        console.log("오늘 챗 기록 없음");
      }
    
  } catch (err) {
    console.error('미션 확인 중 오류:', err);
  }


};

function markMissionComplete(type) {
  let selector;

  if (type === "emotion") {
    selector = 'a[href="emo_main.html"].icon-item';
  } else if (type === "chat") {
    selector = 'a[href="test_0526.html"].icon-item';
  } else {
    console.warn("알 수 없는 미션 타입:", type);
    return;
  }

  const icon = document.querySelector(selector);

  if (icon) {
    icon.classList.remove('mission-incomplete');
    icon.classList.add('mission-complete');

    // 👉 이미지 변경은 emotion만
    if (type === "emotion") {
      const img = icon.querySelector('img');
      if (img) {
        img.src = '../이미지/HAPPPY.png';
      }
    }
  } else {
    console.log(`❌ ${type} 아이콘을 찾을 수 없음`);
  }
}


// 🔥 페이지 로드 시 미션 상태 확인
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    checkAndUpdateMission();
  }, 500)
});

// 감정 저장 후에도 미션 상태 업데이트 (기존 저장 함수에 추가)
const saveEmotion = async () => {
  // ... 기존 감정 저장 로직 ...
  
  // 저장 성공 후 미션 상태 확인
  await checkAndUpdateMission();
};
const user_id = localStorage.getItem("user_id");
//
function updateLevelDisplay(level) {
  const levelCard = document.querySelector('.status-section .level-card');
  if (!levelCard) return;

  const img = levelCard.querySelector('img');
  const text = levelCard.querySelector('.level-text');

  if (text) text.textContent = `LV.${level}`;

  if (img) {
    if (level === 1) {
      img.src = '../이미지/level1.png';
    } else if (level === 2) {
      img.src = '../이미지/level2.png';
    } else if (level === 3) {
      img.src = '../이미지/level3.png';
    } else if (level === 4) {
      img.src = '../이미지/level4.png';
    }
  }
}

async function fetchPlantStatus() {
  const user_id = localStorage.getItem("user_id");

  if (user_id) {
    let { data: plant_status, error } = await db
      .from('plant_status')
      .select('current_level')
      .eq('user_id', user_id)
      .single();

    if (error) {
      console.error('DB 조회 에러:', error);
    } else {
      console.log('현재 레벨:', plant_status.current_level);
      updateLevelDisplay(plant_status.current_level);
    }
  } else {
    console.log('user_id가 없어서 조회하지 않음');
  }
}

// 페이지 로드 후 실행
document.addEventListener('DOMContentLoaded', () => {
  fetchPlantStatus();
});
