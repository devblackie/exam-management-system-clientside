  import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";                                   
                                                                         
  export async function POST(req: NextRequest) {                         
    try {                                                                
      const body = await req.json();                                     
      const {                                                            
        institutionName, fullName, jobTitle, email,                      
        studentCount, howHeard, message,                                 
      } = body;                                                          
                                                                         
      if (!institutionName || !fullName || !email || !studentCount) {    
        return NextResponse.json(                                        
          { message: "Missing required fields." },                       
          { status: 400 }                                                
        );  }                                                                  
      const transporter = nodemailer.createTransport({                  
        host:   process.env.SMTP_HOST,                                  
        port:   Number(process.env.SMTP_PORT) || 587,                   
        secure: false,                                                   
        auth: {                                                          
          user: process.env.SMTP_USER,                                  
          pass: process.env.SMTP_PASS,                                  
        },                                                               
      });  
                                                              
      await transporter.sendMail({                                       
        from:    `"SenateDesk" <${process.env.SMTP_USER}>`,             
        to:      process.env.NOTIFY_EMAIL,                              
        replyTo: email,                                                  
        subject: `New Pilot Request — ${institutionName}`,              
        html: `                                                          
          <h2>New Pilot Request</h2>                                     
          <table>                                                        
            <tr><td><b>Institution</b></td><td>${institutionName}</td></tr>
            <tr><td><b>Name</b></td><td>${fullName} (${jobTitle})</td></tr>
            <tr><td><b>Email</b></td><td>${email}</td></tr>             
            <tr><td><b>Students</b></td><td>${studentCount}</td></tr>   
            <tr><td><b>How heard</b></td><td>${howHeard||"N/A"}</td></tr>
            <tr><td><b>Message</b></td><td>${message||"—"}</td></tr>   
          </table>                                                       
        `,                                                               
      });                                                                
                                                                         
      return NextResponse.json({ ok: true });                            
    } catch (err: unknown) {                                             
      console.error("[pilot-request]", err);                            
      return NextResponse.json(                                          
        { message: "Server error. Please try again." },                 
        { status: 500 }                                                  
      );                                                                 
    }                                                                    
  }                                                                      