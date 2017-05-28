package com.tongshi.servlet;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.tongshi.common.DBUtils;
@WebServlet(name = "ReplayServlet",
		urlPatterns = { "/serv" } )
public class ReplayServlet extends HttpServlet {

	/**
	 * Constructor of the object.
	 */
	public ReplayServlet() {
		super();
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
		
		String feed =  request.getParameter("feed"); 
		String list = request.getParameter("list");
		String d = request.getParameter("d"); 
		
		//System.out.println(feed + "  "  +  list + "  " + d);
		
		String result = "";
		
		if(feed == null) return;
		
		if(feed.equals("category"))
		{
			result = DBUtils.SelectChannelInfo();
		}
		
		if(feed.equals("channel"))
		{
			if(list ==null || d == null) return;
			
			int day = 0;
			
			try {
				day = Integer.valueOf(d);
			} catch (Exception e) {
				// TODO: handle exception
				e.printStackTrace();
				return;
			}
			
			
			result = DBUtils.SelectChannel(list, day);
			
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
