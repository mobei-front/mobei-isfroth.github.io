import { Github, Wrench, BookOpen } from 'lucide-react';

const links = [
  { name: '个人博客', icon: BookOpen, url: '#', color: 'from-blue-500 to-cyan-500' },
  { name: 'GitHub', icon: Github, url: '#', color: 'from-gray-500 to-gray-700' },
  { name: '工具箱', icon: Wrench, url: '#', color: 'from-purple-500 to-pink-500' },
];

export default function QuickLinks() {
  return (
    <div className="glass-card p-2.5 sm:p-3 md:p-4 glow-border h-full flex flex-col min-h-0">
      <h3 className="text-[10px] sm:text-xs md:text-sm font-semibold text-white mb-1.5 sm:mb-2 md:mb-3 flex items-center gap-1.5 sm:gap-2 font-serif flex-shrink-0">
        <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-cyan-glow" />
        快捷导航
      </h3>

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-3 flex-1 content-center">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            className="group flex flex-col items-center gap-1 sm:gap-1.5 md:gap-2 p-1.5 sm:p-2 md:p-3 rounded-lg hover:bg-white/5 transition-all duration-300"
          >
            <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-md`}>
              <link.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="text-[10px] sm:text-xs md:text-sm text-midnight-100 group-hover:text-white transition-colors font-serif">
              {link.name}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
