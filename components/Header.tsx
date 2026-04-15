"use client"

import { Calendar } from "lucide-react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "./ui/navigation-menu"
import Link from "next/link"
import { Separator } from "./ui/separator"

function Header() {
	const { theme, setTheme } = useTheme()
	
  return (
    <header className="sticky top-0 z-10 bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
				<div className="text-primary flex items-center gap-2 font-bold text-xl">
          <Calendar/>
          <span>schedutch</span>
        </div>
				
				<div className="flex gap-2 justify-center items-center">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
					>
						<Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
						<Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
						<span className="sr-only">テーマ切り替え</span>
					</Button>
					
					<Separator orientation="vertical" />
					
					<div className="flex items-center gap-2 font-bold text-xl">
						<NavigationMenu>
							<NavigationMenuList>
								<NavigationMenuItem>
									<NavigationMenuTrigger>Pages</NavigationMenuTrigger>
									<NavigationMenuContent>
										<ul className="p-2">
											<li>
												<NavigationMenuLink
													className={navigationMenuTriggerStyle()}
													render={
														<Link
															href="/"
															className="flex justify-center items-center select-none rounded-md leading-none no-underline outline-none transition-colors"
														>
															<div className="w-7 text-sm font-medium leading-none">Top</div>
															<Separator orientation="vertical"/>
															<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
																トップページ
															</p>
														</Link>	
													}
												>
												</NavigationMenuLink>
											</li>
											<li>
												<NavigationMenuLink
													className={navigationMenuTriggerStyle()}
													render={
														<Link
															href="/new"
															className="flex justify-center items-center select-none rounded-md leading-none no-underline outline-none transition-colors"
														>
															<div className="w-7 text-sm font-medium leading-none">New</div>
															<Separator orientation="vertical"/>
															<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
																新規イベント
															</p>
														</Link>
													}
												>
												</NavigationMenuLink>
											</li>
										</ul>
									</NavigationMenuContent>
								</NavigationMenuItem>
							</NavigationMenuList>
						</NavigationMenu>
					</div>
				</div>
			</div>
    </header>
  )
}

export default Header