import { Link } from 'react-router-dom';
import { Database, Sparkles, FolderOpen, Zap, Shield, BarChart3 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 relative">
      <nav className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">URLStash</span>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            Web Scraping Made
            <span className="text-blue-600"> Simple & Smart</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            Extract content from any website, organize it into projects, and let AI help you analyze and understand your data. Perfect for marketers, researchers, and founders.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start Scraping Free
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                See How It Works
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Quick Scraping</h3>
            <p className="text-slate-600 dark:text-slate-300">
              Simply paste a URL and extract titles, headings, and links in seconds. No coding required.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
              <FolderOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Project Organization</h3>
            <p className="text-slate-600 dark:text-slate-300">
              Group related scrapes into projects. Tag and search across all your collected data.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">AI Insights</h3>
            <p className="text-slate-600 dark:text-slate-300">
              Let AI summarize pages, extract key points, and generate relevant tags automatically.
            </p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-white dark:bg-slate-800/50 py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Enter URL</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Paste any website URL you want to scrape
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Scrape Content</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Extract titles, headings, links, and metadata
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Analyze & Organize</h3>
              <p className="text-slate-600 dark:text-slate-300">
                View results, get AI insights, and organize into projects
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Secure & Private</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">Your data is encrypted and only accessible to you</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Unlimited Projects</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">Create as many projects as you need to stay organized</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">AI-Powered</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">Advanced AI analyzes and summarizes your scraped content</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-blue-600 text-white py-16 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Scraping?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who trust URLStash for their web scraping needs.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-white !text-slate-900 hover:bg-slate-100">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-600 dark:text-slate-400">
          <p>&copy; 2025 URLStash. Cohort6-G83</p>
        </div>
      </footer>
    </div>
  );
}
