interface Quiz {
  topic: string;
  difficulty: string;
  content: string;
}

interface Course {
  title: string;
  content: string;
}

interface Lesson {
  module_title: string;
  lesson_title: string;
  content: string;
}

export const exportQuizToText = (quiz: Quiz) => {
  const content = JSON.parse(quiz.content);
  let text = `${content.title}\n`;
  text += `Topic: ${quiz.topic}\n`;
  text += `Difficulty: ${quiz.difficulty}\n\n`;

  if (content.multipleChoice?.length > 0) {
    text += 'Multiple Choice Questions:\n\n';
    content.multipleChoice.forEach((q: any, i: number) => {
      text += `${i + 1}. ${q.question}\n`;
      q.options.forEach((option: string, j: number) => {
        text += `   ${String.fromCharCode(97 + j)}. ${option}\n`;
      });
      text += `   Answer: ${q.answer}\n\n`;
    });
  }

  if (content.fillInBlanks?.length > 0) {
    text += 'Fill in the Blanks:\n\n';
    content.fillInBlanks.forEach((q: any, i: number) => {
      text += `${i + 1}. ${q.question}\n`;
      text += `   Answer: ${q.answer}\n\n`;
    });
  }

  if (content.trueFalse?.length > 0) {
    text += 'True/False Questions:\n\n';
    content.trueFalse.forEach((q: any, i: number) => {
      text += `${i + 1}. ${q.statement}\n`;
      text += `   Answer: ${q.answer ? 'True' : 'False'}\n\n`;
    });
  }

  if (content.shortAnswer?.length > 0) {
    text += 'Short Answer Questions:\n\n';
    content.shortAnswer.forEach((q: any, i: number) => {
      text += `${i + 1}. ${q.question}\n`;
      text += `   Answer: ${q.answer}\n\n`;
    });
  }

  const blob = new Blob([text], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${quiz.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_quiz.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const exportCourseToText = (course: Course) => {
  const content = JSON.parse(course.content);
  let text = `${content.title}\n\n`;

  if (content.description) {
    text += `Description:\n${content.description}\n\n`;
  }

  if (content.modules) {
    content.modules.forEach((module: any, i: number) => {
      text += `Module ${i + 1}: ${module.title}\n\n`;
      
      if (module.description) {
        text += `${module.description}\n\n`;
      }

      if (module.lessons) {
        module.lessons.forEach((lesson: any, j: number) => {
          text += `Lesson ${j + 1}: ${lesson.title}\n`;
          text += `${lesson.description || ''}\n\n`;
        });
      }
      
      text += '\n';
    });
  }

  const blob = new Blob([text], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_course.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const exportLessonToText = (lesson: Lesson) => {
  const blob = new Blob([
    `${lesson.module_title} - ${lesson.lesson_title}\n\n${lesson.content}`
  ], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${lesson.module_title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${lesson.lesson_title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
