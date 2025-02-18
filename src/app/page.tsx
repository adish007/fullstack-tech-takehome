import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#000_0%,transparent_50%)]"></div>
        <div className="container mx-auto px-6 py-32 relative">
          <div className="max-w-2xl">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-orange-500 font-mono">SECURITY FIRST</span>
            </div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Secure Infrastructure
              <span className="block text-orange-500">For The Modern Era</span>
            </h1>
            <p className="text-lg mb-8 text-gray-400 max-w-xl">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <div className="flex space-x-4">
              <button className="bg-orange-500 text-white px-8 py-3 rounded-lg font-medium 
                hover:bg-orange-600 transition-all">
                Secure Now
              </button>
              <button className="border border-zinc-700 text-white px-8 py-3 rounded-lg font-medium 
                hover:border-orange-500 transition-all">
                Discover →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="border-y border-zinc-800 bg-zinc-900/50">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-1">XX.XX%</div>
              <div className="text-gray-400 text-sm">Security Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">XXK+</div>
              <div className="text-gray-400 text-sm">Threats Blocked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">X.XX M</div>
              <div className="text-gray-400 text-sm">Protected Assets</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">XXX+</div>
              <div className="text-gray-400 text-sm">Global Deployments</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-16 text-white">Advanced Protection Systems</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Quantum Defense"
              description="Ipsum quantum-resistant algorithmic protection with advanced entropy generation"
              icon="🛡️"
            />
            <FeatureCard 
              title="Zero-Trust Matrix"
              description="Lorem systematic verification protocols with continuous authentication frameworks"
              icon="🔒"
            />
            <FeatureCard 
              title="Neural Shield"
              description="Duis aute irure dolor in reprehenderit in voluptate velit"
              icon="🔐"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-zinc-900">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Ready for Maximum Security?</h2>
          <p className="mb-8 text-gray-400">
            Consectetur adipiscing elit. Join the next generation of protected enterprises.
          </p>
          <button className="bg-orange-500 text-white px-8 py-3 rounded-lg font-medium 
            hover:bg-orange-600 transition-all">
            Initialize Security Protocol
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-gray-400 py-12 border-t border-zinc-800">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-white mb-4">SecureGuard</h3>
              <p className="text-sm">
                Lorem ipsum security solutions for the modern infrastructure paradigm
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Solutions</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-orange-500 transition-colors">Neural Shield</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition-colors">Zero-Trust Matrix</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition-colors">Quantum Defense</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-orange-500 transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition-colors">Certifications</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-orange-500 transition-colors">Security Portal</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition-colors">System Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-800 mt-12 pt-8 text-sm text-center">
            © 2024 SecureGuard. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

const FeatureCard = ({ title, description, icon }: FeatureCardProps) => {
  return (
    <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-800 hover:border-orange-500 transition-all duration-300">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold mb-3 text-white">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  )
}
