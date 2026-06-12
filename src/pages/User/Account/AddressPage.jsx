import { ButtonIconText } from "@/components/ui/Button/Button";
import { SectionCard } from "@/components/ui/Section/Section";
import { ArrowDownAZ, Ellipsis, MapPin, Plus, Search } from "lucide-react";
import { useState } from "react";

const AddressPage = () => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="px-6 py-6">
        <SectionCard
            title="Address"
            desc="Edit the user's address."
        >
          <div className="flex justify-end items-center">
            <ButtonIconText 
              text={"Add address"} 
              icon={Plus}
              className={`bg-brand! text-[#ffff]!`}
              classNameIcon={`border-[#ffff]! text-[#ffff]!`}
            />
          </div>
          <div className="my-7"></div>
          <div className="flex justify-between items-center">
            <div className="flex-1">
              {/* SEARCH */}
              <div
                className={`
                  flex items-center gap-3
                  rounded-full border border-subtle px-4 py-2
                  transition-all duration-300
                  ${
                    isFocused 
                      ? "w-96 border-brand! shadow-sm" 
                      : "w-55 border-subtle!"}
                `}
              >
                <Search size={20} className="shrink-0 text-brand" />

                <input
                  type="text"
                  placeholder="Tìm kiếm địa chỉ..."
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="w-full bg-transparent outline-none"
                />
              </div>
            </div>

            {/* Button filter */}
            <div className="flex justify-between items-center gap-3">
              <ButtonIconText 
                text={"Show All Address"} 
                icon={MapPin}
                className={"rounded-full!"}
              />
              <ButtonIconText 
                text={"Show by name A-Z"} 
                icon={ArrowDownAZ}
                className={"rounded-full!"}
              />
            </div>
          </div>
          {/* Table */}
          <div className="mt-8 overflow-x-auto rounded-lg overflow-hidden border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Company Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Company Address</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Notes</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700"></th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-600">Active</td>
                  <td className="px-4 py-3 text-sm text-gray-600">Sample Company</td>
                  <td className="px-4 py-3 text-sm text-gray-600">123 Street, City, Country</td>
                  <td className="px-4 py-3 text-sm text-gray-600">-</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="">
                      <button
                        className="
                          text-center rounded-full! border-2! border-border! p-1
                          text-border! transition
                          hover:text-inherit! hover:border-[#0000]!
                        "
                      >
                        <Ellipsis size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </SectionCard>
    </div>
  )
}

export default AddressPage