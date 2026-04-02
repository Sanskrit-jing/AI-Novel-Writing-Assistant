import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface PublishSite {
  id: string;
  name: string;
  url: string;
  isOfficial: boolean;
  publishedWorks: {
    id: string;
    title: string;
  }[];
}

const defaultSites: PublishSite[] = [
  {
    id: "1",
    name: "起点中文网",
    url: "https://www.qidian.com",
    isOfficial: true,
    publishedWorks: [],
  },
  {
    id: "2",
    name: "创世中文网",
    url: "https://chuangshi.qq.com",
    isOfficial: true,
    publishedWorks: [],
  },
  {
    id: "3",
    name: "番茄小说",
    url: "https://fanqienovel.com",
    isOfficial: true,
    publishedWorks: [],
  },
  {
    id: "4",
    name: "阅文集团",
    url: "https://www.yuewen.com",
    isOfficial: true,
    publishedWorks: [],
  },
];

export default function PublishPage() {
  const [sites, setSites] = useState<PublishSite[]>(defaultSites);
  const [newSite, setNewSite] = useState({
    name: "",
    url: "",
  });
  const [selectedSite, setSelectedSite] = useState<PublishSite | null>(null);
  const [newWork, setNewWork] = useState({
    title: "",
  });

  const handleAddSite = () => {
    if (newSite.name && newSite.url) {
      const site: PublishSite = {
        id: Date.now().toString(),
        name: newSite.name,
        url: newSite.url,
        isOfficial: false,
        publishedWorks: [],
      };
      setSites([...sites, site]);
      setNewSite({ name: "", url: "" });
    }
  };

  const handleAddWork = () => {
    if (selectedSite && newWork.title) {
      const updatedSites = sites.map((site) => {
        if (site.id === selectedSite.id) {
          return {
            ...site,
            publishedWorks: [
              ...site.publishedWorks,
              {
                id: Date.now().toString(),
                title: newWork.title,
              },
            ],
          };
        }
        return site;
      });
      setSites(updatedSites);
      setNewWork({ title: "" });
      setSelectedSite(updatedSites.find((site) => site.id === selectedSite.id) || null);
    }
  };

  const handleDeleteWork = (siteId: string, workId: string) => {
    const updatedSites = sites.map((site) => {
      if (site.id === siteId) {
        return {
          ...site,
          publishedWorks: site.publishedWorks.filter((work) => work.id !== workId),
        };
      }
      return site;
    });
    setSites(updatedSites);
    if (selectedSite && selectedSite.id === siteId) {
      setSelectedSite(updatedSites.find((site) => site.id === siteId) || null);
    }
  };

  const handleDeleteSite = (siteId: string) => {
    setSites(sites.filter((site) => site.id !== siteId));
    if (selectedSite && selectedSite.id === siteId) {
      setSelectedSite(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">作品发布管理</h1>
      </div>

      <Tabs defaultValue="sites" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="sites">发布平台</TabsTrigger>
          <TabsTrigger value="add-site">添加平台</TabsTrigger>
        </TabsList>

        <TabsContent value="sites" className="space-y-4">
          {sites.map((site) => (
            <Card key={site.id} className="mb-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {site.name}
                    {site.isOfficial && <Badge variant="secondary">官方</Badge>}
                  </CardTitle>
                  <CardDescription>
                    <a href={site.url} target="_blank" rel="noopener noreferrer">
                      {site.url}
                    </a>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedSite(site)}
                  >
                    管理作品
                  </Button>
                  {!site.isOfficial && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteSite(site.id)}
                    >
                      删除
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    已发布作品: {site.publishedWorks.length}
                  </Badge>
                  <Button
                    asChild
                    size="sm"
                    variant="default"
                  >
                    <a href={site.url} target="_blank" rel="noopener noreferrer">
                      前往发布
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="add-site" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>添加自定义发布平台</CardTitle>
              <CardDescription>添加您想要发布作品的自定义平台</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <span className="text-sm font-medium">平台名称</span>
                <Input
                  id="site-name"
                  value={newSite.name}
                  onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                  placeholder="例如：我的个人网站"
                />
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">平台网址</span>
                <Input
                  id="site-url"
                  value={newSite.url}
                  onChange={(e) => setNewSite({ ...newSite, url: e.target.value })}
                  placeholder="例如：https://www.example.com"
                />
              </div>
              <Button onClick={handleAddSite}>添加平台</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedSite && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{selectedSite.name} - 作品管理</CardTitle>
            <CardDescription>管理在该平台发布的作品</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <span className="text-sm font-medium">添加作品</span>
              <div className="flex gap-2">
                <Input
                  id="work-title"
                  value={newWork.title}
                  onChange={(e) => setNewWork({ title: e.target.value })}
                  placeholder="作品名称"
                  className="flex-1"
                />
                <Button onClick={handleAddWork}>添加</Button>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">已发布作品</h3>
              {selectedSite.publishedWorks.length === 0 ? (
                <p className="text-muted-foreground">暂无已发布作品</p>
              ) : (
                <div className="space-y-2">
                  {selectedSite.publishedWorks.map((work) => (
                    <div
                      key={work.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <span>{work.title}</span>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteWork(selectedSite.id, work.id)}
                      >
                        删除
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
