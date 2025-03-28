
import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

interface QAItem {
  id: number;
  question: string;
  askedBy: string;
  date: string;
  answers: Answer[];
}

interface Answer {
  id: number;
  text: string;
  answeredBy: string;
  date: string;
  helpful: number;
  notHelpful: number;
  userVote: 'helpful' | 'notHelpful' | null;
}

interface ProductQAProps {
  productId: number;
}

// Mock data for demo purposes
const mockQAs: QAItem[] = [
  {
    id: 1,
    question: "Is this suitable for a child's wrist?",
    askedBy: "Parent123",
    date: "2023-09-12",
    answers: [
      {
        id: 1,
        text: "Yes, our bands are adjustable and can fit children's wrists. The smallest size would be best.",
        answeredBy: "StoreAdmin",
        date: "2023-09-13",
        helpful: 12,
        notHelpful: 2,
        userVote: null
      },
      {
        id: 2,
        text: "I bought this for my 10-year-old and it fits perfectly!",
        answeredBy: "HappyCustomer",
        date: "2023-09-14",
        helpful: 8,
        notHelpful: 0,
        userVote: null
      }
    ]
  },
  {
    id: 2,
    question: "How long does the color last before fading?",
    askedBy: "ColorLover",
    date: "2023-08-25",
    answers: [
      {
        id: 3,
        text: "I've had mine for 6 months with regular wear and the colors are still vibrant.",
        answeredBy: "RegularUser",
        date: "2023-08-26",
        helpful: 15,
        notHelpful: 3,
        userVote: null
      }
    ]
  }
];

const ProductQA: React.FC<ProductQAProps> = ({ productId }) => {
  const [qaItems, setQaItems] = useState<QAItem[]>(mockQAs);
  const [newQuestion, setNewQuestion] = useState('');
  const [userName, setUserName] = useState('');
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [answerName, setAnswerName] = useState('');
  
  const { toast } = useToast();

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newQuestion.trim() || !userName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your question and name",
        variant: "destructive",
      });
      return;
    }
    
    const newQA: QAItem = {
      id: qaItems.length + 1,
      question: newQuestion,
      askedBy: userName,
      date: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
      answers: []
    };
    
    setQaItems([...qaItems, newQA]);
    setNewQuestion('');
    setUserName('');
    setShowQuestionForm(false);
    
    toast({
      title: "Question submitted",
      description: "Your question has been submitted successfully",
    });
  };

  const handleAnswerSubmit = (questionId: number) => {
    if (!newAnswer.trim() || !answerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your answer and name",
        variant: "destructive",
      });
      return;
    }
    
    const updatedQAs = qaItems.map(qa => {
      if (qa.id === questionId) {
        const newAnswerObj: Answer = {
          id: Math.max(0, ...qa.answers.map(a => a.id)) + 1,
          text: newAnswer,
          answeredBy: answerName,
          date: new Date().toISOString().split('T')[0],
          helpful: 0,
          notHelpful: 0,
          userVote: null
        };
        
        return {
          ...qa,
          answers: [...qa.answers, newAnswerObj]
        };
      }
      return qa;
    });
    
    setQaItems(updatedQAs);
    setNewAnswer('');
    setAnswerName('');
    setReplyingTo(null);
    
    toast({
      title: "Answer submitted",
      description: "Your answer has been submitted successfully",
    });
  };

  const handleVote = (questionId: number, answerId: number, voteType: 'helpful' | 'notHelpful') => {
    const updatedQAs = qaItems.map(qa => {
      if (qa.id === questionId) {
        const updatedAnswers = qa.answers.map(answer => {
          if (answer.id === answerId) {
            if (answer.userVote === voteType) {
              // Undo vote
              return {
                ...answer,
                [voteType]: answer[voteType] - 1,
                userVote: null
              };
            } else if (answer.userVote) {
              // Change vote
              return {
                ...answer,
                helpful: voteType === 'helpful' ? answer.helpful + 1 : answer.helpful - (answer.userVote === 'helpful' ? 1 : 0),
                notHelpful: voteType === 'notHelpful' ? answer.notHelpful + 1 : answer.notHelpful - (answer.userVote === 'notHelpful' ? 1 : 0),
                userVote: voteType
              };
            } else {
              // New vote
              return {
                ...answer,
                [voteType]: answer[voteType] + 1,
                userVote: voteType
              };
            }
          }
          return answer;
        });
        
        return {
          ...qa,
          answers: updatedAnswers
        };
      }
      return qa;
    });
    
    setQaItems(updatedQAs);
  };

  return (
    <div className="mt-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <MessageSquare className="mr-2" size={24} />
          Questions & Answers
        </h2>
        <Button
          onClick={() => setShowQuestionForm(!showQuestionForm)}
          className="bg-wolly-magenta hover:bg-wolly-magenta/90"
        >
          Ask a Question
        </Button>
      </div>
      
      {showQuestionForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ask a Question</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleQuestionSubmit}>
              <div className="space-y-4">
                <div>
                  <Textarea
                    placeholder="What would you like to know about this product?"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="h-24"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Your Name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowQuestionForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Submit Question</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      {qaItems.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">No questions yet. Be the first to ask!</p>
      ) : (
        <div className="space-y-6">
          {qaItems.map((qa) => (
            <Card key={qa.id} className="border-l-4 border-l-wolly-magenta">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-medium">{qa.question}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Asked by {qa.askedBy}
                    </p>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar size={14} className="mr-1" />
                    {qa.date}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {qa.answers.length > 0 ? (
                  <div className="space-y-4 pl-4 border-l">
                    {qa.answers.map((answer) => (
                      <div key={answer.id} className="relative">
                        <p className="mb-2">{answer.text}</p>
                        <div className="flex justify-between items-center text-sm">
                          <div className="text-muted-foreground">
                            {answer.answeredBy} • {answer.date}
                          </div>
                          <div className="flex items-center space-x-4">
                            <button 
                              className={`flex items-center text-sm ${answer.userVote === 'helpful' ? 'text-green-600' : 'text-muted-foreground'}`}
                              onClick={() => handleVote(qa.id, answer.id, 'helpful')}
                            >
                              <ThumbsUp size={14} className="mr-1" />
                              {answer.helpful}
                            </button>
                            <button 
                              className={`flex items-center text-sm ${answer.userVote === 'notHelpful' ? 'text-red-600' : 'text-muted-foreground'}`}
                              onClick={() => handleVote(qa.id, answer.id, 'notHelpful')}
                            >
                              <ThumbsDown size={14} className="mr-1" />
                              {answer.notHelpful}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No answers yet.</p>
                )}
              </CardContent>
              
              <CardFooter className="pt-2 flex-col items-start">
                {replyingTo === qa.id ? (
                  <div className="w-full space-y-4">
                    <Textarea
                      placeholder="Your answer"
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      className="h-20"
                    />
                    <Input
                      placeholder="Your Name"
                      value={answerName}
                      onChange={(e) => setAnswerName(e.target.value)}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setReplyingTo(null)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleAnswerSubmit(qa.id)}
                      >
                        Submit Answer
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-wolly-magenta"
                    onClick={() => setReplyingTo(qa.id)}
                  >
                    <MessageSquare size={14} className="mr-2" />
                    Answer this question
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductQA;
