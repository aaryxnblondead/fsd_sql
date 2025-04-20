import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="flex flex-col items-center">
      <div className="max-w-5xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-hr-blue to-hr-green text-transparent bg-clip-text">
          Master SQL with Interactive Challenges
        </h1>
        
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Practice writing SQL queries, get instant feedback, and learn from AI-powered explanations. 
          The perfect platform to level up your database skills.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          {isAuthenticated ? (
            <Link 
              to="/challenges" 
              className="py-3 px-8 bg-hr-blue text-white font-bold rounded-md hover:bg-opacity-90 transition-colors"
            >
              Start Practicing
            </Link>
          ) : (
            <>
              <Link 
                to="/register" 
                className="py-3 px-8 bg-hr-blue text-white font-bold rounded-md hover:bg-opacity-90 transition-colors"
              >
                Get Started - It's Free
              </Link>
              <Link 
                to="/login" 
                className="py-3 px-8 border border-hr-dark-accent text-white font-bold rounded-md hover:bg-hr-dark-accent transition-colors"
              >
                Log In
              </Link>
            </>
          )}
        </div>
      </div>
      
      {/* Feature section */}
      <div className="w-full max-w-6xl grid md:grid-cols-3 gap-8 mt-8">
        <FeatureCard 
          title="Interactive SQL Editor" 
          description="Write and execute SQL queries in a powerful editor with syntax highlighting, auto-completion, and error checking."
          icon="✏️"
        />
        <FeatureCard 
          title="Instant Feedback" 
          description="Run your queries against real databases and get immediate results, with clear visuals showing what's right and wrong."
          icon="⚡"
        />
        <FeatureCard 
          title="AI Explanations" 
          description="Confused by an error? Our AI assistant analyzes your queries and provides detailed explanations to help you learn."
          icon="🤖"
        />
      </div>
      
      {/* How it works section */}
      <div className="w-full max-w-6xl mt-16">
        <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <StepCard 
            number="1" 
            title="Choose a Challenge" 
            description="Browse challenges categorized by difficulty and SQL concepts."
          />
          <StepCard 
            number="2" 
            title="Write Your Query" 
            description="Use our editor to write SQL code that solves the challenge."
          />
          <StepCard 
            number="3" 
            title="Get Instant Feedback" 
            description="See results immediately and learn from AI-powered explanations."
          />
        </div>
      </div>
      
      {/* CTA section */}
      <div className="w-full max-w-3xl mt-16 p-8 bg-hr-dark-secondary rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to improve your SQL skills?</h2>
        <p className="text-gray-300 mb-6">
          Join thousands of learners who are mastering SQL through our interactive platform.
        </p>
        
        {isAuthenticated ? (
          <Link 
            to="/dashboard" 
            className="py-3 px-8 bg-hr-green text-white font-bold rounded-md hover:bg-opacity-90 transition-colors"
          >
            Go to Dashboard
          </Link>
        ) : (
          <Link 
            to="/register" 
            className="py-3 px-8 bg-hr-green text-white font-bold rounded-md hover:bg-opacity-90 transition-colors"
          >
            Start Learning Now
          </Link>
        )}
      </div>
    </div>
  );
}

// Feature card component
function FeatureCard({ title, description, icon }) {
  return (
    <div className="p-6 bg-hr-dark-secondary rounded-lg">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}

// Step card component
function StepCard({ number, title, description }) {
  return (
    <div className="p-6 bg-hr-dark-secondary rounded-lg relative">
      <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-hr-blue flex items-center justify-center font-bold text-white">
        {number}
      </div>
      <h3 className="text-xl font-bold mb-2 mt-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}

export default Home; 