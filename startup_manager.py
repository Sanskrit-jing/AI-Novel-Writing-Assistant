import tkinter as tk
from tkinter import ttk, messagebox
import subprocess
import threading
import time
import os
import sys

class StartupManager:
    def __init__(self, root):
        self.root = root
        self.root.title("AI Novel Writing Assistant - 启动管理器")
        self.root.geometry("800x600")
        self.root.resizable(True, True)
        
        # 设置现代风格
        self.style = ttk.Style()
        self.style.theme_use('clam')
        
        # 现代配色方案
        self.bg_color = '#f0f2f5'
        self.accent_color = '#1890ff'
        self.text_color = '#333333'
        self.success_color = '#52c41a'
        self.warning_color = '#faad14'
        self.error_color = '#f5222d'
        
        # 配置样式
        self.style.configure('TFrame', background=self.bg_color)
        self.style.configure('TLabel', background=self.bg_color, foreground=self.text_color, font=('Segoe UI', 10))
        self.style.configure('TButton', font=('Segoe UI', 10), padding=6)
        self.style.configure('Accent.TButton', background=self.accent_color, foreground='white')
        self.style.configure('Success.TButton', background=self.success_color, foreground='white')
        self.style.configure('Warning.TButton', background=self.warning_color, foreground='white')
        self.style.configure('Error.TButton', background=self.error_color, foreground='white')
        self.style.configure('TNotebook', background=self.bg_color)
        self.style.configure('TNotebook.Tab', font=('Segoe UI', 10), padding=[10, 5])
        self.style.configure('TText', font=('Consolas', 9))
        
        # 主框架
        self.main_frame = ttk.Frame(root, padding=20)
        self.main_frame.pack(fill=tk.BOTH, expand=True)
        
        # 标题
        self.title_label = ttk.Label(self.main_frame, text="AI小说写作助手 - 启动管理器", font=('Segoe UI', 18, 'bold'), foreground=self.accent_color)
        self.title_label.pack(pady=20)
        
        # 选项卡
        self.notebook = ttk.Notebook(self.main_frame)
        self.notebook.pack(fill=tk.BOTH, expand=True, pady=10)
        
        # 启动选项卡
        self.startup_tab = ttk.Frame(self.notebook)
        self.notebook.add(self.startup_tab, text="启动管理")
        
        # 服务状态选项卡
        self.status_tab = ttk.Frame(self.notebook)
        self.notebook.add(self.status_tab, text="服务状态")
        
        # 日志选项卡
        self.log_tab = ttk.Frame(self.notebook)
        self.notebook.add(self.log_tab, text="运行日志")
        
        # 服务进程
        self.processes = {}
        
        # 日志文本
        self.log_text = None
        
        # 状态标签
        self.status_labels = {}
        
        # 配置启动选项卡
        self.setup_startup_tab()
        
        # 配置服务状态选项卡
        self.setup_status_tab()
        
        # 配置日志选项卡
        self.setup_log_tab()
        
        # 检查是否在项目根目录
        if not os.path.exists('package.json'):
            messagebox.showwarning("警告", "请在项目根目录运行此脚本")
            self.root.destroy()
            return
    
    def setup_startup_tab(self):
        """设置启动选项卡"""
        # 启动选项框架
        startup_frame = ttk.Frame(self.startup_tab, padding=20)
        startup_frame.pack(fill=tk.BOTH, expand=True)
        
        # 按钮容器
        button_frame = ttk.Frame(startup_frame)
        button_frame.pack(pady=20)
        
        # 一键启动所有服务
        self.start_all_btn = ttk.Button(button_frame, text="一键启动所有服务", style='Accent.TButton', command=self.start_all_services)
        self.start_all_btn.grid(row=0, column=0, padx=10, pady=10, sticky='ew')
        
        # 停止所有服务
        self.stop_all_btn = ttk.Button(button_frame, text="停止所有服务", style='Error.TButton', command=self.stop_all_services)
        self.stop_all_btn.grid(row=0, column=1, padx=10, pady=10, sticky='ew')
        
        # 环境变量同步
        self.sync_env_btn = ttk.Button(button_frame, text="同步环境变量", style='Warning.TButton', command=self.sync_environment)
        self.sync_env_btn.grid(row=1, column=0, padx=10, pady=10, sticky='ew')
        
        # 构建项目
        self.build_btn = ttk.Button(button_frame, text="构建项目", style='Success.TButton', command=self.build_project)
        self.build_btn.grid(row=1, column=1, padx=10, pady=10, sticky='ew')
        
        # 单独服务控制
        services_frame = ttk.LabelFrame(startup_frame, text="单独服务控制", padding=20)
        services_frame.pack(fill=tk.BOTH, expand=True, pady=20)
        
        # 服务按钮网格
        service_buttons_frame = ttk.Frame(services_frame)
        service_buttons_frame.pack(fill=tk.BOTH, expand=True)
        
        # Shared服务
        ttk.Label(service_buttons_frame, text="Shared服务").grid(row=0, column=0, padx=10, pady=5, sticky='w')
        ttk.Button(service_buttons_frame, text="启动", command=lambda: self.start_service('shared')).grid(row=0, column=1, padx=10, pady=5)
        ttk.Button(service_buttons_frame, text="停止", command=lambda: self.stop_service('shared')).grid(row=0, column=2, padx=10, pady=5)
        
        # Server服务
        ttk.Label(service_buttons_frame, text="Server服务").grid(row=1, column=0, padx=10, pady=5, sticky='w')
        ttk.Button(service_buttons_frame, text="启动", command=lambda: self.start_service('server')).grid(row=1, column=1, padx=10, pady=5)
        ttk.Button(service_buttons_frame, text="停止", command=lambda: self.stop_service('server')).grid(row=1, column=2, padx=10, pady=5)
        
        # Client服务
        ttk.Label(service_buttons_frame, text="Client服务").grid(row=2, column=0, padx=10, pady=5, sticky='w')
        ttk.Button(service_buttons_frame, text="启动", command=lambda: self.start_service('client')).grid(row=2, column=1, padx=10, pady=5)
        ttk.Button(service_buttons_frame, text="停止", command=lambda: self.stop_service('client')).grid(row=2, column=2, padx=10, pady=5)
    
    def setup_status_tab(self):
        """设置服务状态选项卡"""
        status_frame = ttk.Frame(self.status_tab, padding=20)
        status_frame.pack(fill=tk.BOTH, expand=True)
        
        # 状态标题
        ttk.Label(status_frame, text="服务运行状态", font=('Segoe UI', 12, 'bold')).pack(pady=10)
        
        # 状态列表
        status_list_frame = ttk.Frame(status_frame)
        status_list_frame.pack(fill=tk.BOTH, expand=True)
        
        # 所有服务状态
        ttk.Label(status_list_frame, text="所有服务: " , font=('Segoe UI', 10, 'bold')).grid(row=0, column=0, padx=10, pady=5, sticky='w')
        self.status_labels['all'] = ttk.Label(status_list_frame, text="未启动", foreground=self.text_color)
        self.status_labels['all'].grid(row=0, column=1, padx=10, pady=5, sticky='w')
        
        # Shared服务状态
        ttk.Label(status_list_frame, text="Shared服务: " , font=('Segoe UI', 10, 'bold')).grid(row=1, column=0, padx=10, pady=5, sticky='w')
        self.status_labels['shared'] = ttk.Label(status_list_frame, text="未启动", foreground=self.text_color)
        self.status_labels['shared'].grid(row=1, column=1, padx=10, pady=5, sticky='w')
        
        # Server服务状态
        ttk.Label(status_list_frame, text="Server服务: " , font=('Segoe UI', 10, 'bold')).grid(row=2, column=0, padx=10, pady=5, sticky='w')
        self.status_labels['server'] = ttk.Label(status_list_frame, text="未启动", foreground=self.text_color)
        self.status_labels['server'].grid(row=2, column=1, padx=10, pady=5, sticky='w')
        
        # Client服务状态
        ttk.Label(status_list_frame, text="Client服务: " , font=('Segoe UI', 10, 'bold')).grid(row=3, column=0, padx=10, pady=5, sticky='w')
        self.status_labels['client'] = ttk.Label(status_list_frame, text="未启动", foreground=self.text_color)
        self.status_labels['client'].grid(row=3, column=1, padx=10, pady=5, sticky='w')
        
        # 刷新状态按钮
        ttk.Button(status_frame, text="刷新状态", command=self.update_status).pack(pady=20)
    
    def setup_log_tab(self):
        """设置日志选项卡"""
        log_frame = ttk.Frame(self.log_tab, padding=20)
        log_frame.pack(fill=tk.BOTH, expand=True)
        
        # 日志文本框
        self.log_text = tk.Text(log_frame, wrap=tk.WORD, font=('Consolas', 9))
        self.log_text.pack(fill=tk.BOTH, expand=True, pady=10)
        
        # 滚动条
        scrollbar = ttk.Scrollbar(self.log_text, command=self.log_text.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.log_text.config(yscrollcommand=scrollbar.set)
        
        # 清空日志按钮
        ttk.Button(log_frame, text="清空日志", command=self.clear_log).pack(pady=10)
    
    def start_all_services(self):
        """启动所有服务"""
        self.log("正在启动所有服务...")
        
        if not self.check_pnpm_availability():
            self.log("错误: pnpm未安装或未添加到系统PATH")
            return
        
        # 同步环境变量
        self.sync_environment()
        
        # 启动所有服务
        def start_process():
            try:
                process = subprocess.Popen(
                    ['pnpm', 'dev'],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True
                )
                
                self.processes['all'] = process
                self.update_status()
                
                # 读取输出
                for line in iter(process.stdout.readline, ''):
                    self.log(line.strip())
                
                process.stdout.close()
                process.wait()
                
                if process.returncode != 0:
                    self.log(f"服务启动失败，返回代码: {process.returncode}")
                
                self.update_status()
            except Exception as e:
                self.log(f"启动服务时出错: {str(e)}")
                self.update_status()
        
        threading.Thread(target=start_process, daemon=True).start()
    
    def stop_all_services(self):
        """停止所有服务"""
        self.log("正在停止所有服务...")
        
        for service, process in list(self.processes.items()):
            try:
                process.terminate()
                process.wait(timeout=5)
                self.log(f"{service} 服务已停止")
            except Exception as e:
                self.log(f"停止 {service} 服务时出错: {str(e)}")
            finally:
                del self.processes[service]
        
        self.update_status()
    
    def start_service(self, service):
        """启动单个服务"""
        self.log(f"正在启动 {service} 服务...")
        
        if not self.check_pnpm_availability():
            self.log("错误: pnpm未安装或未添加到系统PATH")
            return
        
        # 同步环境变量
        self.sync_environment()
        
        # 服务命令映射
        service_commands = {
            'shared': ['pnpm', 'dev:shared'],
            'server': ['pnpm', 'dev:server'],
            'client': ['pnpm', 'dev:client']
        }
        
        if service not in service_commands:
            self.log(f"未知服务: {service}")
            return
        
        def start_process():
            try:
                process = subprocess.Popen(
                    service_commands[service],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True
                )
                
                self.processes[service] = process
                self.update_status()
                
                # 读取输出
                for line in iter(process.stdout.readline, ''):
                    self.log(line.strip())
                
                process.stdout.close()
                process.wait()
                
                if process.returncode != 0:
                    self.log(f"{service} 服务启动失败，返回代码: {process.returncode}")
                
                self.update_status()
            except Exception as e:
                self.log(f"启动 {service} 服务时出错: {str(e)}")
                self.update_status()
        
        threading.Thread(target=start_process, daemon=True).start()
    
    def stop_service(self, service):
        """停止单个服务"""
        if service in self.processes:
            self.log(f"正在停止 {service} 服务...")
            try:
                self.processes[service].terminate()
                self.processes[service].wait(timeout=5)
                self.log(f"{service} 服务已停止")
                del self.processes[service]
            except Exception as e:
                self.log(f"停止 {service} 服务时出错: {str(e)}")
            finally:
                self.update_status()
        else:
            self.log(f"{service} 服务未运行")
    
    def check_pnpm_availability(self):
        """检查pnpm是否可用"""
        try:
            subprocess.run(
                ['pnpm', '--version'],
                capture_output=True,
                text=True,
                timeout=10
            )
            return True
        except Exception as e:
            self.log(f"pnpm不可用: {str(e)}")
            return False
    
    def sync_environment(self):
        """同步环境变量"""
        self.log("正在同步环境变量...")
        
        if not self.check_pnpm_availability():
            self.log("错误: pnpm未安装或未添加到系统PATH")
            return
        
        try:
            result = subprocess.run(
                ['pnpm', 'sync-env'],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                self.log("环境变量同步成功")
            else:
                self.log(f"环境变量同步失败: {result.stderr}")
        except Exception as e:
            self.log(f"同步环境变量时出错: {str(e)}")
    
    def build_project(self):
        """构建项目"""
        self.log("正在构建项目...")
        
        if not self.check_pnpm_availability():
            self.log("错误: pnpm未安装或未添加到系统PATH")
            return
        
        def build_process():
            try:
                process = subprocess.Popen(
                    ['pnpm', 'build'],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True
                )
                
                # 读取输出
                for line in iter(process.stdout.readline, ''):
                    self.log(line.strip())
                
                process.stdout.close()
                process.wait()
                
                if process.returncode == 0:
                    self.log("项目构建成功")
                else:
                    self.log(f"项目构建失败，返回代码: {process.returncode}")
            except Exception as e:
                self.log(f"构建项目时出错: {str(e)}")
        
        threading.Thread(target=build_process, daemon=True).start()
    
    def update_status(self):
        """更新服务状态"""
        # 更新所有服务状态
        if 'all' in self.processes:
            self.status_labels['all'].config(text="运行中", foreground=self.success_color)
        else:
            self.status_labels['all'].config(text="未启动", foreground=self.text_color)
        
        # 更新单个服务状态
        for service in ['shared', 'server', 'client']:
            if service in self.processes:
                self.status_labels[service].config(text="运行中", foreground=self.success_color)
            else:
                self.status_labels[service].config(text="未启动", foreground=self.text_color)
    
    def log(self, message):
        """记录日志"""
        if self.log_text:
            timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
            self.log_text.insert(tk.END, f"[{timestamp}] {message}\n")
            self.log_text.see(tk.END)
    
    def clear_log(self):
        """清空日志"""
        if self.log_text:
            self.log_text.delete(1.0, tk.END)
            self.log("日志已清空")

if __name__ == "__main__":
    root = tk.Tk()
    app = StartupManager(root)
    root.mainloop()