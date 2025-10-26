export default function Footer() {
  return (
    <footer className="mt-20 sm:mt-24 bg-slate-900 text-slate-300 py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h4 className="font-semibold text-white mb-3">About HireOG</h4>
          <p className="text-sm">HireOG helps candidates overcome interview anxiety and build confidence with AI-powered insights, tools, and learning resources.</p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/problems" className="hover:underline">Questions</a></li>
            <li><a href="/ai-interview" className="hover:underline">Ai Interview</a></li>
            <li><a href="/quiz" className="hover:underline"></a>Quiz</li>
            <li><a href="/prep-plans" className="hover:underline">Prep Plans</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li>Email: <a href="mailto:hello@hireog.com" className="hover:underline">hello@hireog.com</a></li>
            <li>Address: Bengaluru, India</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Follow Us</h4>
          <div className="flex gap-4">
            <a href="https://www.linkedin.com/company/hireog" className="hover:text-white">LinkedIn</a>
          </div>
        </div>
      </div>
      <div className="mt-10 text-center text-xs text-slate-500 border-t border-slate-700 pt-6">© 2025 HireOG — All rights reserved.</div>
    </footer>
  );
}
