import React, { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import { formatPrice } from '../utils/formatPrice';

interface EmiCalculatorProps {
  basePrice: number;
}

const EmiCalculator: React.FC<EmiCalculatorProps> = ({ basePrice }) => {
  const [downPayment, setDownPayment] = useState<number>(basePrice * 0.2); // 20% default
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(5);
  
  const [emi, setEmi] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);

  // Update default downpayment if basePrice changes significantly
  useEffect(() => {
    setDownPayment(basePrice * 0.2);
  }, [basePrice]);

  useEffect(() => {
    const principal = basePrice - downPayment;
    if (principal <= 0) {
      setEmi(0);
      setTotalInterest(0);
      setTotalPayment(downPayment);
      return;
    }

    const r = interestRate / 12 / 100;
    const n = tenureYears * 12;
    
    // EMI formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
    if (r === 0) {
      setEmi(principal / n);
      setTotalInterest(0);
      setTotalPayment(basePrice);
      return;
    }

    const calculatedEmi = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const calculatedTotalPayment = calculatedEmi * n;
    
    setEmi(Math.round(calculatedEmi));
    setTotalInterest(Math.round(calculatedTotalPayment - principal));
    setTotalPayment(Math.round(calculatedTotalPayment + downPayment));
  }, [basePrice, downPayment, interestRate, tenureYears]);

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm mb-12 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-violet-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none"></div>
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="bg-violet-100 p-2 rounded-xl text-violet-600">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Smart EMI Calculator</h3>
          <p className="text-sm text-gray-500">Plan your finances instantly</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Sliders Area */}
        <div className="lg:col-span-7 space-y-6">
          {/* Down Payment */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="text-sm font-semibold text-gray-700">Down Payment</label>
              <div className="text-lg font-black text-violet-700">{formatPrice(downPayment)}</div>
            </div>
            <input 
              type="range" 
              min="0" 
              max={basePrice} 
              step="10000"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1 font-medium">
              <span>₹0</span>
              <span>{(downPayment / basePrice * 100).toFixed(0)}%</span>
              <span>{formatPrice(basePrice)}</span>
            </div>
          </div>

          {/* Interest Rate & Tenure Row */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="text-sm font-semibold text-gray-700">Interest Rate</label>
                <div className="text-lg font-black text-gray-900">{interestRate}% p.a.</div>
              </div>
              <input 
                type="range" 
                min="5" 
                max="15" 
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="text-sm font-semibold text-gray-700">Loan Tenure</label>
                <div className="text-lg font-black text-gray-900">{tenureYears} Years</div>
              </div>
              <input 
                type="range" 
                min="1" 
                max="7" 
                step="1"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
              />
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-5 bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col justify-center">
          <div className="text-center mb-6">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Monthly EMI</div>
            <div className="text-4xl font-black text-gray-900">₹{emi.toLocaleString('en-IN')}</div>
          </div>
          
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Principal Amount</span>
              <span className="font-bold text-gray-800">₹{(basePrice - downPayment).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Interest Payable</span>
              <span className="font-bold text-orange-600">₹{totalInterest.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="font-bold text-gray-700">Total Cost of Car</span>
              <span className="font-black text-violet-700">₹{totalPayment.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmiCalculator;
