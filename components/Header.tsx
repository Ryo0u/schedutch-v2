import { Calendar } from "lucide-react"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "./ui/navigation-menu"
import Link from "next/link"

function header() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
				<div className="flex items-center gap-2 font-bold text-xl">
          <Calendar/>
          <span>schedutch</span>
        </div>
				
				<div className="flex items-center gap-2 font-bold text-xl">
					<NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Pages</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="p-2">
										<li>
                      <NavigationMenuLink>
                        <Link
                          href="/"
                          className="block select-none rounded-md space-y-1 leading-none no-underline outline-none transition-colors"
                        >
                          <div className="text-sm font-medium leading-none">Top</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            トップページに戻る
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink>
                        <Link
                          href="/new"
                          className="block select-none rounded-md space-y-1 leading-none no-underline outline-none transition-colors"
                        >
                          <div className="text-sm font-medium leading-none">New</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            新しい予定を作成
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
				</div>
			</div>
    </header>
  )
}

export default header