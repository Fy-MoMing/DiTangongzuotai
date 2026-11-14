export const greetings = [
  '把今天过得轻盈一点。',
  '新的一天，慢慢来。',
  '愿今天的忙碌都有回响。',
  '认真做事，也记得喝水。',
  '手里的事，一件件做好。',
  '好好开始，从这一刻起。',
  '给忙碌留一点呼吸。',
  '不急，先把眼前做好。',
  '今天，也有新的可能。',
  '让每一份认真都有着落。',
  '脚踏实地，心有余闲。',
  '把复杂的事慢慢理顺。',
  '愿每次沟通都顺顺当当。',
  '清楚一点，轻松一点。',
  '从容开始，稳稳向前。',
  '今天的努力，正在积累。',
  '一件小事，也值得用心。',
  '让工作有序，让心情舒展。',
  '先喝口水，再开始吧。',
  '留一点耐心给今天。',
  '把每一步走得踏实。',
  '用心的细节，会被看见。',
  '愿今天有好消息到来。',
  '做好眼前，余下慢慢来。',
  '忙而有序，也是一种自在。',
  '给今天一个温柔的开场。',
  '心里有数，做事从容。',
  '认真报价，轻松沟通。',
  '愿每份信任都有好回应。',
  '一步一步，也会走很远。',
  '把平常的日子过得认真。',
  '今天，试着少一点匆忙。',
  '事情有先后，心里不着急。',
  '把注意力放回当下。',
  '做事细致，待人温和。',
  '愿你忙得踏实，闲得安心。',
  '一份清楚，一份安心。',
  '给每个细节一点耐心。',
  '稳稳当当，也很好。',
  '新的订单，新的开始。',
  '愿今天比昨天顺手一点。',
  '有条不紊地开始吧。',
  '每一次核对，都多一分安心。',
  '让准确成为日常习惯。',
  '不必赶路，先看清方向。',
  '把节奏调到适合自己。',
  '专注眼前，也记得抬头。',
  '愿生活与工作都留有余地。',
  '今天的清单，一项项完成。',
  '把小小的进展也记在心里。',
  '好状态，从一点松弛开始。',
  '让每次报价都清清楚楚。',
  '迎接今天，也照顾自己。',
  '做一点，进一点。',
  '愿每次合作都愉快。',
  '给努力一点时间。',
  '先整理思路，再动手。',
  '一份耐心，多一份妥帖。',
  '脚步可以慢，方向要清楚。',
  '把忙碌变得井井有条。',
  '愿今天的心情有点明亮。',
  '把每一份托付认真接住。',
  '细节做好，心里踏实。',
  '今天，也给自己一点鼓励。',
  '用清楚的报价，传递用心。',
  '保持热爱，也保持耐心。',
  '把每一笔都算得明白。',
  '从一件容易的事开始。',
  '愿忙碌之后，有片刻悠闲。',
  '今天的风，也许很温柔。',
  '向前一点，就很好。',
  '留些精力，给喜欢的生活。',
  '再忙，也记得伸个懒腰。',
  '认真工作，按时休息。',
  '把好心情带进工作里。',
  '愿每个问题都慢慢理清。',
  '一次确认，少一些反复。',
  '在熟悉的日常里发现新意。',
  '保持清醒，也保持温柔。',
  '给平凡的一天一点期待。',
  '愿你的付出都有温暖回应。',
  '把准备做足，把心放宽。',
  '今天，按照自己的节奏来。',
  '不慌不忙，也能做好很多。',
  '遇事慢半拍，思路更清楚。',
  '把信任放在每个细节里。',
  '有分寸地忙，有滋味地过。',
  '清晰的开始，顺畅的一天。',
  '每一次用心，都是积累。',
  '把小事做妥，日子就稳。',
  '愿今天的沟通少些等待。',
  '让每一笔生意都有温度。',
  '愿你手头有事，心中有光。',
  '做好准备，迎接新进展。',
  '细心一点，省心很多。',
  '给工作一点秩序，给自己一点空间。',
  '今天，也值得好好对待。',
  '把耐心放进每一次服务。',
  '愿今天顺利，也愿你轻松。',
  '踏踏实实，过好这一天。'
];

export function nextGreeting(state, random = Math.random) {
  const previous = Number.isInteger(state?.previous) ? state.previous : -1;
  let remaining = Array.isArray(state?.remaining) && state.remaining.every(index => Number.isInteger(index) && index >= 0 && index < greetings.length) && new Set(state.remaining).size === state.remaining.length
    ? state.remaining.filter(index => index !== previous) : [];
  if (!remaining.length) {
    remaining = greetings.map((_, index) => index);
    for (let index = remaining.length - 1; index > 0; index--) {
      const other = Math.floor(random() * (index + 1));
      [remaining[index], remaining[other]] = [remaining[other], remaining[index]];
    }
    if (remaining.at(-1) === previous) [remaining[0], remaining[remaining.length - 1]] = [remaining.at(-1), remaining[0]];
  }
  const index = remaining.pop();
  return { text: greetings[index], state: { remaining, previous: index } };
}

let sessionGreeting;
export function getLaunchGreeting() {
  if (sessionGreeting) return sessionGreeting;
  let state;
  try { state = JSON.parse(localStorage.getItem('studioGreetingDeck') || 'null'); } catch { /* Start a new deck if storage is unavailable. */ }
  const next = nextGreeting(state);
  sessionGreeting = next.text;
  try { localStorage.setItem('studioGreetingDeck', JSON.stringify(next.state)); } catch { /* A greeting still works without persistence. */ }
  return sessionGreeting;
}
