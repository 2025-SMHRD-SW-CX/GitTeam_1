window.addEventListener('DOMContentLoaded', async () => {
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  await wait(1000); // 1초 기다렸다가 첫 메시지 출력
  const message1 = "반가워! 내 이름은 삼이야!";
  addMessage('bot', message1);
  await wait(1500); // 1.5초 후 다음 메시지
  const message2 = "오늘부터 너와 이 공간을 꾸며나갈거야! 한번 원하는 말을 써볼래?";
  addMessage('bot', message2);
  await wait(30000);
  const message3 = "자! 이제 나랑 이야기하는 방법을 알았지! 한번 다른 기능들도 사용하러 가보자.홈버튼을 눌러봐!"
  addMessage('bot', message3);
});

