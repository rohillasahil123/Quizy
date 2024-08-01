const fs = require('fs').promises;
require ("../configfile/config.js")
const GkQuestion = require('../Model/OtherQuestion'); 
const path = "C:/HP/Coding/Quizy/Data/QuizzyCSV.csv";



async function readCSVAndSaveToDB(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const lines = data.split('\n');
    const output = [];

    lines.forEach((line) => {
      const fields = line.split(',');
      output.push(fields);
    });

    for (let i = 0; i < output.length; i++) {  // Ensure we don't go out of bounds
      const row = output[i];
      const questionData = {
        question: row[0],
        correctAnswer: row[1],
        options: row.slice(2, 6),
        number: i + 1
      };

      const existingQuestion = await GkQuestion.findOne({ number: questionData.number });
      if (existingQuestion) {
        console.log(`Duplicate question number: ${questionData.number}, skipping...`);
        continue;
      }

      const question = new GkQuestion(questionData);

      try {
        await question.save();
        console.log(`Saved: ${question}`);
      } catch (err) {
        console.error("Error saving to DB:", err);
      }
    }
  } catch (err) {
    console.error("Error while reading the file:", err);
  }
}
(async () => {
  try {
    await readCSVAndSaveToDB(path);
  } catch (err) {
    console.error(err)
  }
})();

async function sendQuestionToUser(combineId) {
  try {
    const user = await CombineDetails.findById(combineId).populate('questionsSent');
    
    if (!user) {
      console.log(`User with combineId ${combineId} not found.`);
      return;
    }
    const sentQuestionIds = user.questionsSent.map(question => question._id);
    const question = await GkQuestion.findOne({ _id: { $nin: sentQuestionIds } });
    if (!question) {
      console.log('No new questions available for this user.');
      return;
    }
    user.questionsSent.push(question);
    await user.save();

    console.log(`Sent question to user: ${question}`);
  } catch (error) {
    console.error("Error sending question to user:", error);
  }
}




