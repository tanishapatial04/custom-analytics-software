import { useState } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { toast } from 'sonner';
import { Send, Sparkles, TrendingUp } from 'lucide-react';

export default function NLQInterface({ projectId }) {
  const [question, setQuestion] = useState('');
  const [dateRange, setDateRange] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post('/nlq', {
        project_id: projectId,
        question: question,
        date_range: dateRange
      });
      
      setResults([{ question, ...response.data }, ...results]);
      setQuestion('');
    } catch (error) {
      toast.error('Failed to process question');
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    "What's my traffic trend this week?",
    "Which pages are most popular?",
    "How many unique visitors did I get?",
    "What's the average session duration?"
  ];

  return (
    <div className="space-y-6" data-testid="nlq-interface">
      {/* Input Section */}
      <Card className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Ask Anything About Your Data</h2>
            <p className="text-slate-600">Get AI-powered insights in natural language</p>
          </div>
        </div>

        <form onSubmit={handleAsk} className="space-y-4">
          <div className="flex gap-3">
            <Input
              data-testid="nlq-question-input"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., What's my traffic trend this week?"
              className="flex-1 text-lg py-6"
              disabled={loading}
            />
            <select
              data-testid="nlq-date-range-selector"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
            <Button
              data-testid="nlq-submit-button"
              type="submit"
              disabled={loading || !question.trim()}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6"
            >
              {loading ? (
                <span className="animate-pulse">Thinking...</span>
              ) : (
                <><Send className="w-5 h-5 mr-2" />Ask</>
              )}
            </Button>
          </div>
        </form>

        {/* Suggested Questions */}
        {results.length === 0 && (
          <div className="mt-6">
            <p className="text-sm text-slate-600 mb-3 font-medium">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, index) => (
                <button
                  key={index}
                  data-testid={`suggested-question-${index}`}
                  onClick={() => setQuestion(q)}
                  className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium hover:bg-indigo-100 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Results */}
      <div className="space-y-6">
        {results.map((result, index) => (
          <Card key={index} className="bg-white rounded-2xl shadow-lg p-8 slide-in" data-testid={`nlq-result-${index}`}>
            <div className="mb-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-slate-600 mb-2">Your Question</div>
                  <div className="text-lg font-semibold text-slate-900">{result.question}</div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-slate-600 mb-2">AI Answer</div>
                  <div className="text-slate-900 leading-relaxed whitespace-pre-wrap">{result.answer}</div>
                  
                  {result.insights && result.insights.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {result.insights.map((insight, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-indigo-700 bg-indigo-50 px-3 py-2 rounded-lg">
                          <Sparkles className="w-4 h-4" />
                          {insight}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
