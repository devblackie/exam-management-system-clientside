"use client";

import { StudentFullRecord } from "@/api/types";

interface StudentProfileHeaderProps {
    student: StudentFullRecord['student'];
} 

export default function StudentProfileHeader({ student }: StudentProfileHeaderProps) {
    return (
        <div className="p-6 bg-gradient-to-br from-green-50 to-white rounded-lg shadow-sm mb-6">


            {/* Student Details */}
            <div className="flex-1 space-y-2 text-center md:text-left">
                <div>
                    <div className="flex items-center justify-between md:justify-start gap-3">
                    <h2 className=" font-black text-sm text-green-darkest/70  uppercase">
                        {student.name}
                    </h2>
                    <span className="bg-green-darkest text-lime-bright text-[10px] font-bold px-2 py-1 rounded">
              YEAR {student.currentYear || 1}
            </span>
          </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-1 mt-2">
                        <p className=" font-mon font-bol text-sm text-green-darkest/70 uppercase">
                            {student.regNo} •
                        </p>
                        <p className=" font-mon  text-sm text-green-darkest/70 ">
                            {student.programName}
                        </p>

                    </div>
                </div>


            </div>
        </div>
    );
}