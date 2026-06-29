import React, { useState, useEffect } from 'react';
import { Map, CalendarDays, Mountain, Leaf, CheckCircle2, AlertCircle, Home, PlusCircle, CheckSquare, Clock, Sprout, Plus, Trash2, Truck, Coins, TrendingUp, Receipt, Wallet, ChevronDown } from 'lucide-react';

export default function App() {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'add_plot' | 'report'
  const [plots, setPlots] = useState([]);
  const [tasks, setTasks] = useState([]);

  // State สำหรับ Report
  const [selectedPlotForReport, setSelectedPlotForReport] = useState('');

  // State สำหรับฟอร์มบันทึกรายละเอียดปุ๋ย/ยา (Tank Mix)
  const [recordModal, setRecordModal] = useState({ show: false, task: null });
  const [currentRecord, setCurrentRecord] = useState({ brand: '', amount: '', unit: 'กิโลกรัม', cost: '' });
  const [savedRecords, setSavedRecords] = useState([]);

  // State สำหรับฟอร์มบันทึกการเก็บเกี่ยว (Harvest Modal)
  const [harvestModal, setHarvestModal] = useState({ show: false, task: null });
  const [harvestData, setHarvestData] = useState({ yieldTons: '', pricePerKg: '', laborCost: '', transportCost: '' });

  // State สำหรับฟอร์มเพิ่มแปลง
  const [formData, setFormData] = useState({
    plotName: '',
    plantDate: '',
    area: '',
    plantsCount: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [showModal, setShowModal] = useState(false);

  // ตั้งค่า Default Plot ให้ Report เมื่อมีแปลงใหม่
  useEffect(() => {
    if (plots.length > 0 && !selectedPlotForReport) {
      setSelectedPlotForReport(plots[0].plotName);
    }
  }, [plots, selectedPlotForReport]);

  // --- LOGIC FUNCTIONS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateTasks = (plotName, plantDateStr) => {
    const plantDate = new Date(plantDateStr);
    const addDays = (date, days) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };
    return [
      { id: Math.random().toString(), plotName, title: 'ใส่ปุ๋ยรอบที่ 1 (บำรุงต้น/ใบ)', date: addDays(plantDate, 30), completed: false, type: 'fertilizer' },
      { id: Math.random().toString(), plotName, title: 'ใส่ปุ๋ยรอบที่ 2', date: addDays(plantDate, 120), completed: false, type: 'fertilizer' },
      { id: Math.random().toString(), plotName, title: 'หยอดแก๊ส/สารเร่งดอก (Forcing)', date: addDays(plantDate, 270), completed: false, type: 'forcing', critical: true },
      { id: Math.random().toString(), plotName, title: 'เก็บเกี่ยวผลผลิตส่งโรงงาน', date: addDays(plantDate, 410), completed: false, type: 'harvest', critical: true }
    ];
  };

  const handleSave = () => {
    const { plotName, plantDate, area, plantsCount } = formData;
    if (!plotName || !plantDate || !area || !plantsCount) {
      setErrorMsg('กรุณากรอกข้อมูลให้ครบถ้วนทุกช่องครับ');
      return;
    }
    const areaNum = parseFloat(area);
    const plantsNum = parseInt(plantsCount);
    if (isNaN(areaNum) || isNaN(plantsNum) || areaNum <= 0) {
      setErrorMsg('กรุณาระบุตัวเลขพื้นที่และจำนวนหน่อให้ถูกต้อง');
      return;
    }

    setErrorMsg('');
    const density = Math.round(plantsNum / areaNum);
    
    const newPlot = { id: Math.random().toString(), plotName, plantDate, area: areaNum, density };
    setPlots([...plots, newPlot]);

    const newTasks = generateTasks(plotName, plantDate);
    setTasks([...tasks, ...newTasks].sort((a, b) => a.date - b.date));

    setShowModal(true);
  };

  const handleTaskClick = (task) => {
    if (!task.completed) {
      if (task.type === 'harvest') {
        setHarvestData({ yieldTons: '', pricePerKg: '', laborCost: '', transportCost: '' });
        setHarvestModal({ show: true, task });
      } else {
        setCurrentRecord({ brand: '', amount: '', unit: 'กิโลกรัม', cost: '' });
        setSavedRecords([]);
        setRecordModal({ show: true, task });
      }
    } else {
      setTasks(tasks.map(t => 
        t.id === task.id ? { ...t, completed: false, records: null, harvestRecord: null } : t
      ));
    }
  };

  const handleAddToList = () => {
    if (!currentRecord.brand.trim()) {
      alert('กรุณาระบุยี่ห้อหรือสูตรก่อนเพิ่มรายการครับ');
      return;
    }
    setSavedRecords([...savedRecords, { ...currentRecord, id: Date.now() }]);
    setCurrentRecord({ brand: '', amount: '', unit: 'กิโลกรัม', cost: '' });
  };

  const handleRemoveRecord = (id) => {
    setSavedRecords(savedRecords.filter(rec => rec.id !== id));
  };

  const saveTaskRecord = () => {
    let finalRecords = [...savedRecords];
    if (currentRecord.brand.trim() !== '') {
      finalRecords.push({ ...currentRecord, id: Date.now() });
    }
    setTasks(tasks.map(t => 
      t.id === recordModal.task.id ? { ...t, completed: true, records: finalRecords } : t
    ));
    setRecordModal({ show: false, task: null });
  };

  const saveHarvestRecord = () => {
    setTasks(tasks.map(t => 
      t.id === harvestModal.task.id ? { ...t, completed: true, harvestRecord: harvestData } : t
    ));
    setHarvestModal({ show: false, task: null });
  };

  // --- UI COMPONENTS ---
  const renderDashboard = () => (
    <div className="p-6 flex-1 overflow-y-auto bg-gray-50 pb-24">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">ตารางงานของฉัน</h2>
        <p className="text-gray-500 text-sm mt-1">แปลงทั้งหมด: {plots.length} แปลง</p>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-10">
          <Sprout className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">ยังไม่มีตารางงาน<br/>กดปุ่ม "เพิ่มแปลงใหม่" เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const isOverdue = new Date() > task.date && !task.completed;
            const isHarvest = task.type === 'harvest';
            
            return (
              <div key={task.id} className={`p-4 rounded-xl border ${task.completed ? 'bg-gray-100 border-gray-200 opacity-70' : isHarvest ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-white border-green-200 shadow-sm'} flex items-start gap-4 transition-all`}>
                <button 
                  onClick={() => handleTaskClick(task)}
                  className={`mt-1 rounded-full p-1 border-2 ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-transparent'}`}
                >
                  <CheckSquare className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-bold ${task.completed ? 'text-gray-500 line-through' : isHarvest ? 'text-amber-800' : 'text-gray-800'}`}>
                      {task.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <Mountain className="w-4 h-4" /> {task.plotName}
                  </p>
                  <p className={`text-sm flex items-center gap-1 mt-1 ${isOverdue ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                    <Clock className="w-4 h-4" /> 
                    {task.date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                    {isOverdue && " (เลยกำหนด)"}
                  </p>

                  {task.completed && !isHarvest && task.records && task.records.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {task.records.map((rec, idx) => (
                        <div key={idx} className="p-2.5 bg-green-50 rounded-lg border border-green-100 text-sm text-green-800">
                          <p><span className="font-bold">{rec.brand || '-'}</span> ({rec.amount || '0'} {rec.unit})</p>
                          {rec.cost && <p className="text-xs text-gray-500">ต้นทุน: ฿{parseFloat(rec.cost).toLocaleString()}</p>}
                        </div>
                      ))}
                      {task.records.some(rec => rec.cost) && (
                        <div className="p-2 text-right text-sm font-bold text-green-700 bg-green-100 rounded-lg">
                          รวมต้นทุน: ฿{task.records.reduce((sum, rec) => sum + (parseFloat(rec.cost) || 0), 0).toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}

                  {task.completed && isHarvest && task.harvestRecord && (
                    <div className="mt-3 p-3 bg-amber-100 rounded-lg border border-amber-200 text-sm text-amber-900">
                      <div className="flex justify-between border-b border-amber-200 pb-1 mb-1">
                        <span>ผลผลิตรวม:</span>
                        <span className="font-bold">{task.harvestRecord.yieldTons || 0} ตัน</span>
                      </div>
                      <div className="flex justify-between border-b border-amber-200 pb-1 mb-1">
                        <span>ราคาขาย:</span>
                        <span className="font-bold">฿{task.harvestRecord.pricePerKg || 0} / กก.</span>
                      </div>
                      <div className="flex justify-between mt-2 pt-2 border-t border-amber-300">
                        <span className="font-bold text-amber-800">รายรับสุทธิ (รอบนี้):</span>
                        <span className="font-bold text-green-700 text-base">
                          ฿{(((parseFloat(task.harvestRecord.yieldTons) || 0) * 1000 * (parseFloat(task.harvestRecord.pricePerKg) || 0)) - 
                             ((parseFloat(task.harvestRecord.laborCost) || 0) + (parseFloat(task.harvestRecord.transportCost) || 0))).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderAddPlot = () => (
    <div className="p-6 flex-1 overflow-y-auto pb-24">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">เริ่มปลูกแปลงใหม่</h2>
        <p className="text-gray-500 text-sm mt-1">บันทึกข้อมูลแปลงเพื่อเริ่มคำนวณวันเก็บเกี่ยว</p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center text-sm rounded-r-md">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">1. ชื่อแปลง</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mountain className="h-5 w-5 text-gray-400" /></div>
            <input type="text" name="plotName" value={formData.plotName} onChange={handleInputChange} className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50" placeholder="เช่น แปลงดอนตาตุ่ม" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">2. วันที่ปลูก</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CalendarDays className="h-5 w-5 text-gray-400" /></div>
            <input type="date" name="plantDate" value={formData.plantDate} onChange={handleInputChange} className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">3. ขนาดเนื้อที่ (ไร่)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Map className="h-5 w-5 text-gray-400" /></div>
            <input type="number" name="area" value={formData.area} onChange={handleInputChange} className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50" placeholder="จำนวนไร่ (เช่น 10)" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">4. จำนวนหน่อที่ปลูก (ต้น)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Leaf className="h-5 w-5 text-gray-400" /></div>
            <input type="number" name="plantsCount" value={formData.plantsCount} onChange={handleInputChange} className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50" placeholder="จำนวนหน่อรวม (เช่น 60000)" />
          </div>
        </div>

        <button onClick={handleSave} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 text-lg">
          บันทึกและสร้างตารางงาน
        </button>
      </div>
    </div>
  );

  // === ฟังก์ชันสำหรับหน้า Report ===
  const renderReport = () => {
    if (plots.length === 0) {
      return (
        <div className="p-6 flex-1 flex flex-col items-center justify-center bg-gray-50 pb-24 text-center">
          <TrendingUp className="w-16 h-16 text-gray-300 mb-3" />
          <h2 className="text-xl font-bold text-gray-700">ยังไม่มีข้อมูลแปลง</h2>
          <p className="text-gray-500 mt-2">กรุณาเพิ่มแปลงและบันทึกข้อมูลการทำงาน<br/>เพื่อดูสรุปผลประกอบการ</p>
        </div>
      );
    }

    // ดึงข้อมูลแปลงที่เลือก
    const plotInfo = plots.find(p => p.plotName === selectedPlotForReport) || plots[0];
    const plotTasks = tasks.filter(t => t.plotName === selectedPlotForReport && t.completed);

    // 1. คำนวณต้นทุนปุ๋ย/ยา
    const fertilizerTasks = plotTasks.filter(t => t.type !== 'harvest');
    const totalFertilizerCost = fertilizerTasks.reduce((sum, task) => {
      if (!task.records) return sum;
      return sum + task.records.reduce((recSum, rec) => recSum + (parseFloat(rec.cost) || 0), 0);
    }, 0);

    // 2. คำนวณรายได้และค่าใช้จ่ายวันเก็บเกี่ยว
    const harvestTask = plotTasks.find(t => t.type === 'harvest');
    let grossIncome = 0;
    let totalHarvestCost = 0;
    let yieldKgs = 0;
    let pricePerKg = 0;

    if (harvestTask && harvestTask.harvestRecord) {
      const rec = harvestTask.harvestRecord;
      yieldKgs = (parseFloat(rec.yieldTons) || 0) * 1000;
      pricePerKg = parseFloat(rec.pricePerKg) || 0;
      grossIncome = yieldKgs * pricePerKg;
      totalHarvestCost = (parseFloat(rec.laborCost) || 0) + (parseFloat(rec.transportCost) || 0);
    }

    const totalCosts = totalFertilizerCost + totalHarvestCost;
    const netProfit = grossIncome - totalCosts;
    const costPerKg = yieldKgs > 0 ? (totalCosts / yieldKgs).toFixed(2) : '0.00';
    const isHarvested = !!harvestTask;

    return (
      <div className="p-6 flex-1 overflow-y-auto bg-gray-100 pb-24 font-sans">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">สรุปผลประกอบการ</h2>
            <p className="text-gray-500 text-sm mt-1">วิเคราะห์ต้นทุนและกำไร</p>
          </div>
        </div>

        {/* ตัวเลือกแปลง */}
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mountain className="h-5 w-5 text-green-600" />
          </div>
          <select 
            value={selectedPlotForReport} 
            onChange={(e) => setSelectedPlotForReport(e.target.value)}
            className="w-full pl-10 p-3 border-none rounded-xl shadow-sm bg-white text-gray-800 font-bold focus:ring-2 focus:ring-green-500 appearance-none"
          >
            {plots.map(p => (
              <option key={p.id} value={p.plotName}>{p.plotName} ({p.area} ไร่)</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* การ์ดสรุปยอดรวม */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <div className="bg-green-600 p-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-5 h-5 opacity-80" />
              <h3 className="font-semibold">กำไรสุทธิ (Net Profit)</h3>
            </div>
            <div className="text-3xl font-bold mt-1">
              {isHarvested ? `฿${netProfit.toLocaleString()}` : 'รอเก็บเกี่ยว'}
            </div>
          </div>
          
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <div className="p-4 text-center">
              <p className="text-xs text-gray-500 mb-1 font-semibold">รายรับรวม</p>
              <p className="text-lg font-bold text-green-600">฿{grossIncome.toLocaleString()}</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-gray-500 mb-1 font-semibold">ต้นทุนรวม</p>
              <p className="text-lg font-bold text-red-500">฿{totalCosts.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* แดชบอร์ดวิเคราะห์ (สำหรับแปลงที่เก็บเกี่ยวแล้ว) */}
        {isHarvested ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-1 font-semibold flex items-center gap-1"><TrendingUp className="w-3 h-3"/> ต้นทุนต่อกิโลกรัม</p>
                <p className="text-xl font-bold text-amber-600">฿{costPerKg}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 mb-1 font-semibold flex items-center gap-1"><Coins className="w-3 h-3"/> ราคาขายเฉลี่ย</p>
                <p className="text-xl font-bold text-blue-600">฿{pricePerKg.toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Receipt className="w-5 h-5 text-gray-400"/> สัดส่วนต้นทุน</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">ค่าปุ๋ย/ยา/แก๊ส</span>
                    <span className="font-semibold">฿{totalFertilizerCost.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: `${totalCosts > 0 ? (totalFertilizerCost/totalCosts)*100 : 0}%`}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">ค่าแรง & ค่ารถส่งโรงงาน</span>
                    <span className="font-semibold">฿{totalHarvestCost.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: `${totalCosts > 0 ? (totalHarvestCost/totalCosts)*100 : 0}%`}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center mt-4">
            <Clock className="w-12 h-12 text-blue-200 mx-auto mb-2" />
            <h3 className="font-bold text-gray-700">แปลงนี้อยู่ระหว่างการปลูก</h3>
            <p className="text-sm text-gray-500 mt-1">ขณะนี้มีต้นทุนสะสม: <strong className="text-red-500">฿{totalCosts.toLocaleString()}</strong></p>
            <p className="text-xs text-gray-400 mt-2">เมื่อทำการบันทึก "เก็บเกี่ยวผลผลิต" <br/>ระบบจะคำนวณกำไรและต้นทุนต่อกิโลกรัมให้ทันที</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[800px] max-h-full relative">
        
        {/* Header */}
        <div className="bg-green-600 text-white p-5 shadow-md flex items-center space-x-3 z-10">
          <Leaf className="w-8 h-8" />
          <div>
            <h1 className="text-xl font-bold">Smart Pineapple</h1>
            <p className="text-green-100 text-sm">ผู้จัดการไร่สับปะรดอัจฉริยะ</p>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'add_plot' && renderAddPlot()}
        {activeTab === 'report' && renderReport()}

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 pb-5 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center p-2 w-20 ${activeTab === 'dashboard' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs font-semibold">หน้าหลัก</span>
          </button>
          <button onClick={() => setActiveTab('add_plot')} className={`flex flex-col items-center p-2 w-20 ${activeTab === 'add_plot' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <PlusCircle className="w-6 h-6 mb-1" />
            <span className="text-xs font-semibold">เพิ่มแปลงใหม่</span>
          </button>
          <button onClick={() => setActiveTab('report')} className={`flex flex-col items-center p-2 w-20 ${activeTab === 'report' ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <TrendingUp className="w-6 h-6 mb-1" />
            <span className="text-xs font-semibold">สรุปผล</span>
          </button>
        </div>

        {/* ==============================================
            MODAL 1: บันทึกปุ๋ย/ยา
        ============================================== */}
        {recordModal.show && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200">
              <h3 className="text-xl font-bold text-gray-800 mb-1">บันทึกข้อมูลการทำงาน</h3>
              <p className="text-gray-500 text-sm mb-4">{recordModal.task?.title}</p>
              
              <div className="max-h-[60vh] overflow-y-auto pr-1">
                {savedRecords.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <h4 className="text-sm font-bold text-green-700">รายการที่ผสม (Tank Mix)</h4>
                    {savedRecords.map((rec) => (
                      <div key={rec.id} className="p-3 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
                        <div className="text-sm text-gray-700">
                          <span className="font-bold">{rec.brand}</span>
                          <p className="text-xs text-gray-500">{rec.amount} {rec.unit} {rec.cost ? `| ฿${rec.cost}` : ''}</p>
                        </div>
                        <button type="button" onClick={() => handleRemoveRecord(rec.id)} className="text-red-400 p-1 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">กรอกข้อมูลปุ๋ย/ยา</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">ยี่ห้อ / สูตร</label>
                      <input type="text" value={currentRecord.brand} onChange={(e) => setCurrentRecord({...currentRecord, brand: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm" />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">ปริมาณที่ใช้</label>
                        <input type="number" value={currentRecord.amount} onChange={(e) => setCurrentRecord({...currentRecord, amount: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm" />
                      </div>
                      <div className="w-[100px]">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">หน่วย</label>
                        <select value={currentRecord.unit} onChange={(e) => setCurrentRecord({...currentRecord, unit: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm">
                          <option value="กิโลกรัม">กก.</option>
                          <option value="ลิตร">ลิตร</option>
                          <option value="กระสอบ">กระสอบ</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">ต้นทุนรายการนี้ (บาท)</label>
                      <input type="number" value={currentRecord.cost} onChange={(e) => setCurrentRecord({...currentRecord, cost: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm" />
                    </div>
                  </div>
                  <button type="button" onClick={handleAddToList} className="w-full mt-4 py-2 border-2 border-dashed border-green-400 text-green-600 rounded-xl font-bold flex items-center justify-center gap-1 hover:bg-green-100 transition-colors text-sm">
                    <Plus className="w-4 h-4" /> กดเพิ่มลงในรายการ
                  </button>
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <button type="button" onClick={() => setRecordModal({ show: false, task: null })} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200">ยกเลิก</button>
                <button type="button" onClick={saveTaskRecord} className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-green-700">บันทึกทั้งหมด</button>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================
            MODAL 2: บันทึกการเก็บเกี่ยวผลผลิต
        ============================================== */}
        {harvestModal.show && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-full"><Coins className="w-6 h-6" /></div>
                <h3 className="text-xl font-bold text-gray-800">สรุปผลผลิตและรายได้</h3>
              </div>
              <p className="text-gray-500 text-sm mb-4">บันทึกข้อมูลเพื่อคำนวณรายรับรอบนี้</p>
              
              <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <h4 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-1"><Sprout className="w-4 h-4"/> ข้อมูลผลผลิตเข้าโรงงาน</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">น้ำหนักรวมที่ชั่งได้ (ตัน)</label>
                      <input type="number" value={harvestData.yieldTons} onChange={(e) => setHarvestData({...harvestData, yieldTons: e.target.value})} className="w-full p-2.5 border border-amber-300 rounded-lg bg-white text-sm focus:ring-amber-500" placeholder="เช่น 15.5" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">ราคาขายโรงงาน (บาท/กก.)</label>
                      <input type="number" value={harvestData.pricePerKg} onChange={(e) => setHarvestData({...harvestData, pricePerKg: e.target.value})} className="w-full p-2.5 border border-amber-300 rounded-lg bg-white text-sm focus:ring-amber-500" placeholder="เช่น 7.50" />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <h4 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-1"><Truck className="w-4 h-4"/> ค่าใช้จ่ายวันเก็บเกี่ยว</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">ค่าแรงเหมาตัด/หักจุก (บาท)</label>
                      <input type="number" value={harvestData.laborCost} onChange={(e) => setHarvestData({...harvestData, laborCost: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm" placeholder="เช่น 3500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">ค่ารถบรรทุกส่งโรงงาน (บาท)</label>
                      <input type="number" value={harvestData.transportCost} onChange={(e) => setHarvestData({...harvestData, transportCost: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm" placeholder="เช่น 2000" />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-center">
                  <span className="text-xs font-semibold text-green-700 block">หักลบรายรับ-รายจ่ายวันเก็บเกี่ยว</span>
                  <span className="text-2xl font-bold text-green-600">
                    ฿{(((parseFloat(harvestData.yieldTons) || 0) * 1000 * (parseFloat(harvestData.pricePerKg) || 0)) - 
                       ((parseFloat(harvestData.laborCost) || 0) + (parseFloat(harvestData.transportCost) || 0))).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button type="button" onClick={() => setHarvestModal({ show: false, task: null })} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200">ยกเลิก</button>
                <button type="button" onClick={saveHarvestRecord} className="flex-1 bg-amber-500 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-amber-600">บันทึกผลผลิต</button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showModal && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center animate-in zoom-in duration-200">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-gray-800">สร้างตารางงานสำเร็จ!</h3>
              <p className="text-gray-500 mt-2 mb-6">ระบบได้คำนวณวันใส่ปุ๋ย หยอดแก๊ส และวันเก็บเกี่ยวให้คุณแล้ว</p>
              <button
                onClick={() => {
                  setShowModal(false);
                  setFormData({ plotName: '', plantDate: '', area: '', plantsCount: '' });
                  setActiveTab('dashboard');
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors"
              >
                ดูตารางงาน
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
