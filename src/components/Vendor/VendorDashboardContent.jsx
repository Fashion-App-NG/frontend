import { useAuth } from '../../contexts/AuthContext';

// React Component: Main vendor dashboard content matching design
export const VendorDashboardContent = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#d8dfe9]">
      {/* Header */}
      <header className="bg-white border-b border-black/8 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Welcome Section */}
          <div>
            <h1 className="text-[32px] font-bold text-[#3e3e3e] leading-[150%]">
              Welcome {user?.storeName || 'Vendor'}
            </h1>
            <p className="text-[16px] text-[#2e2e2e] leading-[120%] w-[312px]">
              Here is the information about all your orders
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-[284px]">
            <div className="flex items-center bg-[#f5f5f5] rounded-[50px] px-3 py-2 gap-2">
              <div className="w-6 h-6">🔍</div>
              <input 
                type="text" 
                placeholder="Search"
                className="flex-1 bg-transparent outline-none text-[#9e9e9e] text-[16px]"
              />
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-4">
            <div className="w-6 h-6">🔔</div>
            <div className="w-9 h-9 rounded-full bg-gray-300 overflow-hidden">
              <img 
                src="/api/placeholder/36/36" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="px-6 py-5">
        <div className="bg-[#f9f9f9] border border-[#e6edff] rounded-[5px] p-5">
          <div className="grid grid-cols-4 gap-[38px]">
            {/* Total Orders */}
            <div className="flex flex-col gap-3">
              <div>
                <div className="text-[28px] font-bold leading-[150%] text-black">89,935</div>
                <div className="text-[16px] leading-[150%] text-black">Total orders</div>
              </div>
              <div className="flex items-center gap-3 text-[14px] text-[#7c8db5]">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5">📈</div>
                  <span>10.2</span>
                </div>
                <span>+1.01% this week</span>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px bg-[#e6edff] h-[103px] -ml-[19px]"></div>

            {/* Active Orders */}
            <div className="flex flex-col gap-3 -ml-[19px]">
              <div>
                <div className="text-[28px] font-bold leading-[150%] text-black">23,283.5</div>
                <div className="text-[16px] leading-[150%] text-black">Active orders</div>
              </div>
              <div className="flex items-center gap-3 text-[14px] text-[#7c8db5]">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5">📈</div>
                  <span>3.1</span>
                </div>
                <span>+0.49% this week</span>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px bg-[#e6edff] h-[103px] -ml-[19px]"></div>

            {/* Completed Orders */}
            <div className="flex flex-col gap-3 -ml-[19px]">
              <div>
                <div className="text-[28px] font-bold leading-[150%] text-black">46,827</div>
                <div className="text-[16px] leading-[150%] text-black">Completed orders</div>
              </div>
              <div className="flex items-center gap-3 text-[14px] text-[#7c8db5]">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5">📉</div>
                  <span>2.56</span>
                </div>
                <span>-0.91% this week</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Order Analytics Chart */}
          <div className="col-span-2 bg-[#f9f9f9] border border-[#e6edff] rounded-[5px] p-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[24px] font-bold text-black">Order Analytics</h2>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#347ae2]"></div>
                  <span className="text-[12px] font-medium text-black">Offline orders</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#ff9500]"></div>
                  <span className="text-[12px] font-medium text-black">Online orders</span>
                </div>
                <div className="bg-white rounded-lg px-3 py-1 shadow-sm">
                  <div className="flex items-center gap-1 text-[12px] font-medium">
                    <span>Monthly</span>
                    <div className="w-4 h-4">▼</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Chart placeholder */}
            <div className="h-[200px] bg-white rounded border flex items-center justify-center text-gray-500">
              📊 Order Analytics Chart
            </div>
          </div>

          {/* Earnings Chart */}
          <div className="bg-[#f9f9f9] border border-[#e6edff] rounded-[5px] p-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-bold text-black">Earnings</h2>
              <div className="w-6 h-6">⋯</div>
            </div>
            {/* Circle chart placeholder */}
            <div className="h-[216px] flex items-center justify-center text-gray-500">
              🟢 Earnings Chart
            </div>
            <div className="flex items-center justify-center gap-5 mt-5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#34c759]"></div>
                <span className="text-[12px] font-medium text-black">Offline</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#ff9500]"></div>
                <span className="text-[12px] font-medium text-black">Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#347ae2]"></div>
                <span className="text-[12px] font-medium text-black">Trade</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order List */}
      <div className="px-6 pb-6">
        <div className="bg-[#f9f9f9] border border-[#e6edff] rounded-t-[10px] p-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[24px] font-bold text-black">Order List</h2>
            <div className="bg-white rounded-lg px-3 py-1 shadow-sm">
              <div className="flex items-center gap-1 text-[12px] font-medium">
                <span>Monthly</span>
                <div className="w-4 h-4">▼</div>
              </div>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-8 gap-4 bg-[#f9f9f9] py-4 border-b border-black/8 text-[12px] font-semibold text-black">
            <div className="text-center">No</div>
            <div>ID</div>
            <div>Date</div>
            <div>Customer Name</div>
            <div>Location</div>
            <div>Amount</div>
            <div>Status Order</div>
            <div>Action</div>
          </div>

          {/* Sample Order Rows */}
          {[1, 2, 3].map((num) => (
            <div key={num} className="grid grid-cols-8 gap-4 py-4 border-b border-black/8 text-[12px] text-[#111]">
              <div className="text-center font-medium">{num}</div>
              <div className="font-medium">#23459</div>
              <div>Dec 2, 2025</div>
              <div className="font-medium">
                {num === 1 ? "Favour Joseph" : num === 2 ? "Peace Esemezie" : "Remilekun omoyeni"}
              </div>
              <div>
                {num === 1 ? "9 Euba street" : num === 2 ? "Bessie Esiaba," : "9 Euba street"}
              </div>
              <div className="flex items-center gap-1">
                <span>₦</span>
                <span className="font-medium">
                  {num === 1 ? "100,000" : num === 2 ? "500,000" : "100,000"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  num === 1 ? "bg-[#34c759]" : num === 2 ? "bg-[#cd0000]" : "bg-[#ff9500]"
                }`}></div>
                <span className="bg-white px-3 py-1 rounded-lg shadow-sm text-[#2e2e2e]">
                  {num === 1 ? "New Order" : num === 2 ? "Cancelled" : "In Progress"}
                </span>
              </div>
              <div className="text-center">
                <button className="w-8 h-8 hover:bg-gray-100 rounded">⋯</button>
              </div>
            </div>
          ))}

          {/* Empty state when no orders */}
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <p>No orders yet</p>
            <p className="text-sm">Orders will appear here once customers start purchasing</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboardContent;