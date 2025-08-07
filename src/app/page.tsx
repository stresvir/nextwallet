import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import {
  ArrowUpRight,
  CheckCircle2,
  Shield,
  Users,
  Zap,
  Wallet,
  CreditCard,
  Smartphone,
  TrendingUp,
  Lock,
  Clock,
} from "lucide-react";
import { createClient } from "../../supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <Hero />

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Everything You Need in One Wallet
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the future of digital payments with our comprehensive
              wallet solution designed for modern life.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Instant Transfers",
                description:
                  "Send money to anyone, anywhere in seconds with real-time processing",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Bank-Grade Security",
                description:
                  "Your money is protected with advanced encryption and fraud detection",
              },
              {
                icon: <Smartphone className="w-6 h-6" />,
                title: "Mobile First",
                description:
                  "Designed for your smartphone with an intuitive, easy-to-use interface",
              },
              {
                icon: <CreditCard className="w-6 h-6" />,
                title: "Easy Top-ups",
                description:
                  "Add money instantly from your bank account or credit card",
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: "Transaction History",
                description:
                  "Track all your payments and transfers with detailed analytics",
              },
              {
                icon: <CheckCircle2 className="w-6 h-6" />,
                title: "No Hidden Fees",
                description:
                  "Transparent pricing with no surprise charges or monthly fees",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader>
                  <div className="text-emerald-600 mb-2">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get started with your digital wallet in just three simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <Users className="w-8 h-8" />,
                title: "Create Account",
                description:
                  "Sign up with your email and verify your identity in minutes",
              },
              {
                step: "02",
                icon: <Wallet className="w-8 h-8" />,
                title: "Add Money",
                description:
                  "Top up your wallet using your bank account or credit card",
              },
              {
                step: "03",
                icon: <Zap className="w-8 h-8" />,
                title: "Start Sending",
                description:
                  "Send money instantly to friends, family, or businesses",
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full flex items-center justify-center text-white mx-auto">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-emerald-600 border-2 border-emerald-500">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">$50M+</div>
              <div className="text-emerald-100">Transactions Processed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100K+</div>
              <div className="text-emerald-100">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-emerald-100">Uptime Guaranteed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-emerald-100">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <Lock className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">
                Your Security is Our Priority
              </h2>
              <p className="text-gray-600 text-lg">
                We use the same security standards as major banks to protect
                your money and personal information.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="text-left">
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <Shield className="w-5 h-5 text-emerald-600 mr-2" />
                  Advanced Encryption
                </h3>
                <p className="text-gray-600">
                  All data is encrypted using industry-standard AES-256
                  encryption both in transit and at rest.
                </p>
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <Clock className="w-5 h-5 text-emerald-600 mr-2" />
                  Real-time Monitoring
                </h3>
                <p className="text-gray-600">
                  Our AI-powered fraud detection system monitors transactions
                  24/7 to keep your account safe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Digital Wallet Journey?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust us with their digital payments.
            Create your wallet today and experience the future of money.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/sign-up"
              className="inline-flex items-center px-8 py-4 text-white bg-gradient-to-r from-emerald-600 to-blue-600 rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-all font-medium shadow-lg hover:shadow-xl"
            >
              Create Your Wallet
              <ArrowUpRight className="ml-2 w-4 h-4" />
            </a>
            {user && (
              <a
                href="/dashboard"
                className="inline-flex items-center px-8 py-4 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors font-medium"
              >
                Go to Dashboard
                <ArrowUpRight className="ml-2 w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
