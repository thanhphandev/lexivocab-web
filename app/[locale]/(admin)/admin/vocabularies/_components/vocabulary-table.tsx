import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Pencil,
  Trash2,
  Volume2,
  CheckCircle2,
  Plus,
} from "lucide-react";
import type { MasterVocabularyDto } from "@/lib/api/types";

interface VocabularyTableProps {
  vocabularies: MasterVocabularyDto[];
  loading: boolean;
  activeTab: "approved" | "pending";
  onEdit: (vocab: MasterVocabularyDto) => void;
  onDelete: (id: string, word: string) => void;
  onApprove: (id: string) => void;
  onAddClick: () => void;
}

export function VocabularyTable({
  vocabularies,
  loading,
  activeTab,
  onEdit,
  onDelete,
  onApprove,
  onAddClick,
}: VocabularyTableProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Word</TableHead>
                <TableHead>Meaning</TableHead>
                <TableHead>CEFR</TableHead>
                <TableHead>Pronunciation</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-6">
                    <Skeleton className="h-6 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Skeleton className="h-8 w-16 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  if (vocabularies.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Word</TableHead>
                <TableHead>Meaning</TableHead>
                <TableHead>CEFR</TableHead>
                <TableHead>Pronunciation</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="h-72">
                  <div className="flex flex-col items-center justify-center text-center p-8">
                    <div className="p-4 rounded-full bg-muted/50 mb-4">
                      <BookOpen className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-medium">
                      {activeTab === "pending"
                        ? "No community suggestions pending"
                        : "No vocabulary words found"}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-xs">
                      {activeTab === "pending"
                        ? "Community contributions will appear here for review."
                        : "The global dictionary is currently empty. Start by adding some verified terms."}
                    </p>
                    {activeTab !== "pending" && (
                      <Button variant="outline" onClick={onAddClick}>
                        <Plus className="mr-2 h-4 w-4" /> Add First Word
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Word</TableHead>
              <TableHead>Meaning</TableHead>
              <TableHead>CEFR</TableHead>
              <TableHead>Pronunciation</TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vocabularies.map((v) => (
              <TableRow
                key={v.id}
                className="group hover:bg-muted/50 transition-colors"
              >
                <TableCell className="pl-6 font-medium">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <span className="text-primary font-bold">{v.word}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground italic">
                  {v.meaning}
                </TableCell>
                <TableCell>
                  {v.cefrLevel ? (
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] border-primary/20 bg-primary/5 text-primary"
                    >
                      {v.cefrLevel.toUpperCase()}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground/40 text-xs italic">N/A</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-[11px] font-mono text-muted-foreground/80">
                    {v.phoneticUk && (
                      <span className="flex items-center gap-1">
                        <span className="text-[9px] font-bold text-muted-foreground/40">
                          UK
                        </span>{" "}
                        {v.phoneticUk}
                      </span>
                    )}
                    {v.phoneticUs && (
                      <span className="flex items-center gap-1">
                        <span className="text-[9px] font-bold text-muted-foreground/40">
                          US
                        </span>{" "}
                        {v.phoneticUs}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    {activeTab === "pending" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-500 mr-2"
                        onClick={() => onApprove(v.id)}
                        title="Approve Word"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                    {v.audioUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-500"
                        title="Has audio"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(v)}
                    >
                      <Pencil className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onDelete(v.id, v.word)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
