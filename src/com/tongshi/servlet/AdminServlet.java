package com.tongshi.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;

import javax.servlet.ServletException;
import javax.servlet.ServletContext;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.sun.org.apache.xml.internal.security.utils.HelperNodeList;
import com.tongshi.common.CMUtils;
import com.tongshi.common.DBUtils;

@WebServlet(name = "AdminServlet",
		urlPatterns = { "/am" } )
public class AdminServlet extends HttpServlet {

	class myTimerTask extends TimerTask{
		private String id;
		myTimerTask(String id){
			this.id=id;
		}
		@Override
		public void run() {
			// TODO Auto-generated method stub
//			CMUtils.StopChannel(id);
			DBUtils.SetStart(id, 0);
			System.out.println("stop channel "+id+" done!");
		}		
	}
	class myTimer extends Timer{
		public Integer time;//Count Down time in seconds
		public myTimerTask task;
		public myTimer(Integer time) {
			// TODO Auto-generated constructor stub
			this.time = time;
		}
	}
	private Map<String, myTimer> m_TimerList;
	/**
	 * Constructor of the object.
	 */
	public AdminServlet() {
		super();
		m_TimerList = new HashMap<String,myTimer>();
		
	}

	/**
	 * Destruction of the servlet. <br>
	 */
	public void destroy() {
		super.destroy(); // Just puts "destroy" string in log
		// Put your code here
	}

	/**
	 * The doGet method of the servlet. <br>
	 *
	 * This method is called when a form has its tag value method equals to get.
	 * 
	 * @param request the request send by the client to the server
	 * @param response the response send by the server to the client
	 * @throws ServletException if an error occurred
	 * @throws IOException if an error occurred
	 */
	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		response.addHeader("Access-Control-Allow-Origin", "*");
		response.setContentType("text/plain;charset=UTF-8;pageEncoding=UTF-8");
		String op =  request.getParameter("op"); 

		String id =  request.getParameter("id");
		String name =  request.getParameter("name");
		String url =  request.getParameter("url");
		String ip = request.getParameter("ip");
		String time = request.getParameter("time");
		String s = request.getParameter("s");
		
		//System.out.println(feed + "  "  +  list + "  " + d);	
		String result = "";		
		if(op == null) return;		
		if(op.equals("category"))
		{
			result = DBUtils.SelectChannelInfoAdmin();
		}		
		if(op.equals("add"))
		{			
			name = new String(name.getBytes("iso-8859-1"),"UTF-8");
			//name = java.net.URLDecoder.decode(name, "UTF-8"); 
			//System.out.println(name);
			result = DBUtils.InsertChannel(id, name, url,ip);
		}
		else if(op.equals("delete"))
		{
			result = DBUtils.DeleteChannel(id);
		}else if(op.equals("edit"))
		{
			//name = new String(name.getBytes("iso-8859-1"),"UTF-8");
			System.out.println("name :" + name);		
			System.out.println("name byte :" + Arrays.toString(name.getBytes("iso-8859-1")));
			name = new String(name.getBytes("iso-8859-1"),"utf8");
			System.out.println("name :" + name);		
			result = DBUtils.EditChannel(id, name, url,ip);
		}else if(op.equals("meet"))
		{
			System.out.println("name="+name);
			name = new String(name.getBytes("iso-8859-1"),"utf8");
			System.out.println("time="+time);
			DBUtils.UpdateMeet(id, name);			
		}	
		if(op.equals("status"))
		{
			String status = s;
			if(status.equals("stop"))
			{
//				result = CMUtils.StopChannel(id);	
		      	DBUtils.SetStart(id, 0);
				System.out.println("stop channel "+id);
				result="Operate successed";
			}else if(status.equals("start"))
			{
				System.out.println("try to start channel:"+id+" time:"+time+" min");
				if(time.equals("")){
					System.out.println("start channel "+id+" time=forever");
//					result = CMUtils.StartChannel(id);
					DBUtils.SetStart(id, 1);
				}
				else if(time != null){
					try {
						int countDown = Integer.parseInt(time);
						if(countDown!=0){
							System.out.println("start channel "+id+" time="+time +" min");
//							result = CMUtils.StartChannel(id);
							DBUtils.SetStart(id, 1);
							myTimer timer = new myTimer(countDown);	
							myTimerTask task = new myTimerTask(id);
							timer.task = task;
							timer.schedule(task,countDown*60*1000);
							m_TimerList.put(id, timer);
						}
						else{
							System.out.println("start channel "+id+" forever");
							DBUtils.SetStart(id, 1);
						}
					} catch (Exception e) {
						// TODO: handle exception
					}
				}
			}
			else if(status.equals("continue")){
				System.out.println("continue operation");
				result="Operate successed";
				if(time.equals("")){
					myTimer timer = m_TimerList.get(id);
					timer.task.cancel();
					System.out.println("cancel channel "+id+" task");
					result="Cancel Ok";
				}
				if(time != null){
					try {
						int countDown = Integer.parseInt(time);
						myTimer timer = m_TimerList.get(id);
						int time_new = Integer.parseInt(time);
						if(countDown!=0){
							System.out.println("channel "+id+" new time is:"+time_new+" min");
							timer.task.cancel();
							myTimerTask task = new myTimerTask(id);
							timer.task = task;
							timer.schedule(task, time_new*60*1000);
							System.out.println("reschedule done");
							
						}
						else{
							//Just stop timer task for manually stop
							timer.task.cancel();
							System.out.println("stop timer task in channel "+id);
							result="Cancel Ok";
						}
					} catch (Exception e) {
						// TODO: handle exception
						result="Operate failed";
					}
				}	
				System.out.println("result="+result);

			}
		}		
		PrintWriter out = response.getWriter();
		out.print(result);
		out.flush();
		out.close();
	}

	/**
	 * The doPost method of the servlet. <br>
	 *
	 * This method is called when a form has its tag value method equals to post.
	 * 
	 * @param request the request send by the client to the server
	 * @param response the response send by the server to the client
	 * @throws ServletException if an error occurred
	 * @throws IOException if an error occurred
	 */
	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		response.setContentType("text/html");
		PrintWriter out = response.getWriter();
		out.println("<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\">");
		out.println("<HTML>");
		out.println("  <HEAD><TITLE>A Servlet</TITLE></HEAD>");
		out.println("  <BODY>");
		out.print("    This is ");
		out.print(this.getClass());
		out.println(", using the POST method");
		out.println("  </BODY>");
		out.println("</HTML>");
		out.flush();
		out.close();
	}

	/**
	 * Initialization of the servlet. <br>
	 *
	 * @throws ServletException if an error occurs
	 */
	public void init() throws ServletException {
		// Put your code here
	}

}
