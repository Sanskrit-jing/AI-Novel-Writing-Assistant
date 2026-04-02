import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import subprocess
import threading
import os
import time

class AINovelWritingAssistant:
    def __init__(self, root):
        self.root = root
        self.root.title("AI Novel Writing Assistant")
        self.root.geometry("800x600")
        self.root.resizable(True, True)
        
        # 设置现代风格
        self.style = ttk.Style()
        self.style.theme_use('clam')
        
        # 配置颜色方案
        self.style.configure('TLabel', font=('Segoe UI', 10), foreground='#333333')
        self.style.configure('TButton', font=('Segoe UI', 10, 'bold'), padding=10)
        self.style.configure('Header.TLabel', font=('Segoe UI', 14, 'bold'), foreground='#2c3e50')
        self.style.configure('Status.TLabel', font=('Segoe UI', 9), foreground='#7f8c8d')
        
        # 主框架
        self.main_frame = ttk.Frame(root, padding=20)
        self.main_frame.pack(fill=tk.BOTH, expand=True)
        
        # 标题区域
        self.header_frame = ttk.Frame(self.main_frame)
        self.header_frame.pack(fill=tk.X, pady=(0, 20))
        
        self.title_label = ttk.Label(self.header_frame, text="AI Novel Writing Assistant", style='Header.TLabel')
        self.title_label.pack(side=tk.LEFT)
        
        self.status_label = ttk.Label(self.header_frame, text="就绪", style='Status.TLabel')
        self.status_label.pack(side=tk.RIGHT)
        
        # 信息卡片
        self.info_frame = ttk.Frame(self.main_frame, padding=15)
        self.info_frame.pack(fill=tk.X, pady=(0, 20))
        
        self.info_label = ttk.Label(self.info_frame, text="项目信息")
        self.info_label.pack(anchor=tk.W, pady=(0, 10))
        
        self.project_path_var = tk.StringVar(value=os.getcwd())
        self.project_path_entry = ttk.Entry(self.info_frame, textvariable=self.project_path_var, width=80)
        self.project_path_entry.pack(fill=tk.X, pady=(0, 10))
        
        self.open_folder_btn = ttk.Button(self.info_frame, text="打开项目文件夹", command=self.open_project_folder)
        self.open_folder_btn.pack(side=tk.RIGHT)
        
        # 控制按钮区域
        self.controls_frame = ttk.Frame(self.main_frame)
        self.controls_frame.pack(fill=tk.X, pady=(0, 20))
        
        self.start_btn = ttk.Button(self.controls_frame, text="启动项目", command=self.start_project, style='TButton')
        self.start_btn.pack(side=tk.LEFT, padx=10)
        
        self.stop_btn = ttk.Button(self.controls_frame, text="停止项目", command=self.stop_project, state=tk.DISABLED, style='TButton')
        self.stop_btn.pack(side=tk.LEFT, padx=10)
        
        self.refresh_btn = ttk.Button(self.controls_frame, text="刷新状态", command=self.refresh_status, style='TButton')
        self.refresh_btn.pack(side=tk.LEFT, padx=10)
        
        # 日志显示区域
        self.log_frame = ttk.Frame(self.main_frame)
        self.log_frame.pack(fill=tk.BOTH, expand=True)
        
        self.log_label = ttk.Label(self.log_frame, text="启动日志")
        self.log_label.pack(anchor=tk.W, pady=(0, 10))
        
        self.log_text = scrolledtext.ScrolledText(self.log_frame, wrap=tk.WORD, font=('Consolas', 10))
        self.log_text.pack(fill=tk.BOTH, expand=True)
        self.log_text.config(state=tk.DISABLED)
        
        # 底部状态栏
        self.footer_frame = ttk.Frame(root, padding=10)
        self.footer_frame.pack(fill=tk.X, side=tk.BOTTOM)
        
        self.footer_label = ttk.Label(self.footer_frame, text="AI Novel Writing Assistant - 一键启动工具", style='Status.TLabel')
        self.footer_label.pack(side=tk.LEFT)
        
        # 进程变量
        self.process = None
        self.is_running = False
        
    def log(self, message):
        """添加日志消息"""
        self.log_text.config(state=tk.NORMAL)
        self.log_text.insert(tk.END, f"[{time.strftime('%H:%M:%S')}] {message}\n")
        self.log_text.see(tk.END)
        self.log_text.config(state=tk.DISABLED)
    
    def open_project_folder(self):
        """打开项目文件夹"""
        try:
            if os.name == 'nt':  # Windows
                os.startfile(self.project_path_var.get())
            elif os.name == 'posix':  # macOS/Linux
                subprocess.run(['open' if os.uname().sysname == 'Darwin' else 'xdg-open', self.project_path_var.get()])
        except Exception as e:
            messagebox.showerror("错误", f"无法打开文件夹: {str(e)}")
    
    def start_project(self):
        """启动项目"""
        if self.is_running:
            messagebox.showinfo("提示", "项目已经在运行中")
            return
        
        self.log("正在启动项目...")
        self.status_label.config(text="启动中")
        self.start_btn.config(state=tk.DISABLED)
        self.stop_btn.config(state=tk.NORMAL)
        
        # 启动线程执行命令
        threading.Thread(target=self._run_project, daemon=True).start()
    
    def _run_project(self):
        """在后台运行项目"""
        try:
            self.process = subprocess.Popen(
                ['pnpm', 'dev'],
                cwd=self.project_path_var.get(),
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                shell=True
            )
            
            self.is_running = True
            self.status_label.config(text="运行中")
            self.log("项目启动成功！")
            
            # 读取输出（处理编码问题）
            for line in iter(self.process.stdout.readline, b''):
                if not self.is_running:
                    break
                try:
                    # 尝试使用utf-8解码
                    decoded_line = line.decode('utf-8').strip()
                except UnicodeDecodeError:
                    # 失败则尝试使用gbk解码
                    try:
                        decoded_line = line.decode('gbk').strip()
                    except UnicodeDecodeError:
                        # 都失败则使用replace模式
                        decoded_line = line.decode('utf-8', errors='replace').strip()
                self.log(decoded_line)
            
            # 检查进程是否正常结束
            if self.is_running:
                self.process.wait()
                self.is_running = False
                self.status_label.config(text="已停止")
                self.start_btn.config(state=tk.NORMAL)
                self.stop_btn.config(state=tk.DISABLED)
                self.log("项目已停止运行")
                
        except Exception as e:
            self.log(f"启动失败: {str(e)}")
            self.status_label.config(text="启动失败")
            self.start_btn.config(state=tk.NORMAL)
            self.stop_btn.config(state=tk.DISABLED)
            self.is_running = False
    
    def stop_project(self):
        """停止项目"""
        if not self.is_running or not self.process:
            messagebox.showinfo("提示", "项目未在运行")
            return
        
        self.log("正在停止项目...")
        self.status_label.config(text="停止中")
        
        try:
            # 终止进程
            if os.name == 'nt':  # Windows
                subprocess.run(['taskkill', '/F', '/T', '/PID', str(self.process.pid)], shell=True)
            else:  # macOS/Linux
                self.process.terminate()
                self.process.wait(timeout=5)
            
            self.is_running = False
            self.status_label.config(text="已停止")
            self.start_btn.config(state=tk.NORMAL)
            self.stop_btn.config(state=tk.DISABLED)
            self.log("项目已成功停止")
            
        except Exception as e:
            self.log(f"停止失败: {str(e)}")
            self.status_label.config(text="停止失败")
    
    def refresh_status(self):
        """刷新状态"""
        if self.is_running:
            self.status_label.config(text="运行中")
            self.log("状态刷新: 项目正在运行")
        else:
            self.status_label.config(text="就绪")
            self.log("状态刷新: 项目未运行")

if __name__ == "__main__":
    root = tk.Tk()
    app = AINovelWritingAssistant(root)
    root.mainloop()
